import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { readFile } from 'fs/promises';

@Injectable()
export class PodcastsService {
  private readonly logger = new Logger(PodcastsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private normalizeMediaUrl(url?: string | null) {
    const normalized = url?.trim() || '';
    if (!normalized) return '';
    if (/^(https?:)?\/\//i.test(normalized) || normalized.startsWith('data:') || normalized.startsWith('blob:')) {
      return normalized;
    }

    // Always keep relative /uploads paths so smart redirection middleware in main.ts can resolve them
    if (normalized.startsWith('/uploads')) {
      return normalized;
    }

    return normalized;
  }

  private isDirectAudioUrl(url?: string | null) {
    const normalized = url?.trim() || '';
    if (!normalized) return false;
    if (normalized.startsWith('/uploads/podcasts/audio/')) return true;
    try {
      const parsed = new URL(normalized, 'http://local.test');
      return /\.(mp3|m4a|aac|wav|ogg|oga|webm)(\?.*)?$/i.test(`${parsed.pathname}${parsed.search}`);
    } catch {
      return false;
    }
  }

  private assertPlayableAudioUrl(url?: string | null) {
    if (url && !this.isDirectAudioUrl(url)) {
      throw new BadRequestException(
        'Audio URL must be a direct audio file link ending in .mp3, .m4a, .aac, .wav, .ogg, or .webm.',
      );
    }
  }

  private async getDynamicProductionToken(): Promise<string | null> {
    const baseUrl = 'http://e7nama3ak.runasp.net';
    try {
      const response = await fetch(`${baseUrl}/api/Auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@e7nama3ak.com',
          password: 'Admin@123456',
          rememberMe: true,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Dynamic production login failed: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.token || data.data?.accessToken || data.accessToken || null;
    } catch (err) {
      this.logger.error('Failed to get dynamic production token', err);
      return null;
    }
  }

  private remoteDoctorSessionsConfig() {
    const baseUrl = (process.env.DOTNET_API_URL || process.env.MOBILE_API_URL || 'http://e7nama3ak.runasp.net').replace(/\/$/, '');
    const token = process.env.DOTNET_API_TOKEN || process.env.MOBILE_API_TOKEN || '';
    const patientId = process.env.DOTNET_PODCAST_PATIENT_ID || process.env.MOBILE_PODCAST_PATIENT_ID || '1';

    return { baseUrl, token, patientId };
  }

  async createRemoteDoctorSessionPodcast(
    data: any,
    media: { audio?: Express.Multer.File; cover?: Express.Multer.File },
  ) {
    let config = this.remoteDoctorSessionsConfig();
    if (!media.audio) return null;

    // If token is missing, placeholder, or dynamic auth bypass is preferred, log in dynamically
    if (!config.token || config.token.includes('PUT_') || config.token === '') {
      this.logger.log('Acquiring dynamic production token for remote sync...');
      const dynamicToken = await this.getDynamicProductionToken();
      if (dynamicToken) {
        config.token = dynamicToken;
      }
    }

    if (config.patientId.includes('PUT_')) {
      config.patientId = '1';
    }

    if (!config.token || !config.patientId) {
      this.logger.warn('Skipping remote sync: No production auth token available.');
      return null;
    }

    const form = new FormData();
    form.set('SessionType', 'Podcast');
    form.set('ScheduledAt', data.publishDate ? new Date(data.publishDate).toISOString() : new Date().toISOString());
    form.set('Price', '0');
    form.set('AudioUrl', data.audioUrl?.trim() || '');
    form.set('ImageUrl', data.coverImageUrl?.trim() || '');

    try {
      const audioBuffer = await readFile(media.audio.path);
      form.set(
        'MediaFile',
        new Blob([audioBuffer], { type: media.audio.mimetype || 'audio/mpeg' }),
        media.audio.originalname || media.audio.filename,
      );

      this.logger.log(
        `Uploading file to production C# API: ${config.baseUrl}/api/DoctorSessions/${config.patientId}`,
      );

      const response = await fetch(`${config.baseUrl}/api/DoctorSessions/${config.patientId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token.replace(/^Bearer\s+/i, '')}`,
        },
        body: form,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.warn(
          `Remote production C# upload failed: Status ${response.status}. Response: ${text}`,
        );
        return null;
      }

      // C# API returns only a success message — no URL in response body.
      // Query DB immediately for the latest DoctorSession to get the real hosted file URL.
      const latestSession = await this.prisma.doctorSessions.findFirst({
        orderBy: { Id: 'desc' },
        select: { Id: true, AudioUrl: true, ImageUrl: true },
      });

      // C# saves the uploaded file in ImageUrl (not AudioUrl) for sessions
      const hostedUrl = latestSession?.AudioUrl || latestSession?.ImageUrl;

      if (hostedUrl) {
        this.logger.log(`Got production hosted URL from DB: ${hostedUrl}`);
        return { audioUrl: hostedUrl };
      }

      this.logger.log('Successfully uploaded to C# API but could not resolve hosted URL.');
      return null;
    } catch (err) {
      this.logger.error('Failed to sync to remote C# API', err);
      return null;
    }
  }

  private mapPodcastResponse(item: any) {
    if (!item) return null;
    return {
      // PascalCase keys (backend native)
      Id: item.Id,
      Title: item.Title,
      Description: item.Description,
      AudioUrl: item.AudioUrl,
      CoverImageUrl: item.CoverImageUrl,
      DurationInSeconds: item.DurationInSeconds,
      PublishDate: item.PublishDate,
      IsPublished: item.IsPublished,
      Source: item.Source || 'Upload',

      // camelCase keys (production C# API compatibility)
      id: item.Id,
      title: item.Title,
      description: item.Description,
      audioUrl: item.AudioUrl,
      fileUrl: item.AudioUrl,
      coverImageUrl: item.CoverImageUrl,
      durationInSeconds: item.DurationInSeconds,
      duration: Math.round((item.DurationInSeconds || 0) / 60),
      createdAt: item.PublishDate,
      publishDate: item.PublishDate,
      isPublished: item.IsPublished,
      fileName: item.FileName || item.Source || 'Upload',
      source: item.Source || 'Upload',
    };
  }

  async findAll(includeSessions: boolean = false) {
    const episodes = await this.prisma.podcastEpisodes.findMany({
      orderBy: { PublishDate: 'desc' },
    });

    const formattedEpisodes = episodes.map(ep => this.mapPodcastResponse(ep));

    if (!includeSessions) {
      return formattedEpisodes;
    }

    const sessions = await this.prisma.doctorSessions.findMany({
      where: {
        AND: [
          { AudioUrl: { not: null } },
          { AudioUrl: { not: '' } },
        ],
      },
      orderBy: { ScheduledAt: 'desc' },
    });

    // Map DoctorSessions to Podcast format
    const mappedSessions = sessions.map((s) => this.mapPodcastResponse({
      Id: `session-${s.Id}`,
      Title: s.PatientName || `Doctor Podcast #${s.Id}`,
      Description: `Session with Doctor ID: ${s.DoctorId}`,
      AudioUrl: s.AudioUrl,
      CoverImageUrl: s.ImageUrl || '',
      DurationInSeconds: 0, // Not available in DoctorSessions
      PublishDate: s.ScheduledAt,
      IsPublished: true,
      Source: 'DoctorSession',
    }));

    return [...formattedEpisodes, ...mappedSessions].sort(
      (a, b) => new Date(b.PublishDate).getTime() - new Date(a.PublishDate).getTime(),
    );
  }

  async findOne(id: string) {
    if (String(id).startsWith('session-')) {
      const sessionId = parseInt(String(id).replace('session-', ''));
      const session = await this.prisma.doctorSessions.findUnique({
        where: { Id: sessionId },
      });
      if (!session) throw new NotFoundException(`Session with ID ${sessionId} not found`);
      return this.mapPodcastResponse({
        Id: id,
        Title: session.PatientName || `Doctor Podcast #${session.Id}`,
        Description: `Session with Doctor ID: ${session.DoctorId}`,
        AudioUrl: session.AudioUrl,
        CoverImageUrl: session.ImageUrl || '',
        DurationInSeconds: 0,
        PublishDate: session.ScheduledAt,
        IsPublished: true,
        Source: 'DoctorSession',
      });
    }

    const podcastId = parseInt(String(id));
    const podcast = await this.prisma.podcastEpisodes.findUnique({
      where: { Id: podcastId },
    });
    if (!podcast) throw new NotFoundException(`Podcast with ID ${id} not found`);
    return this.mapPodcastResponse(podcast);
  }

  async create(data: any) {
    const title = data.title ?? data.Title;
    const description = data.description ?? data.Description ?? '';
    const audioUrl = data.audioUrl ?? data.AudioUrl ?? '';
    const coverImageUrl = data.coverImageUrl ?? data.CoverImageUrl ?? '';
    const duration = data.duration ?? data.Duration ?? '0';
    const publishDate = data.publishDate ?? data.PublishDate;
    const isPublishedVal = data.isPublished ?? data.IsPublished;
    const isPublished = isPublishedVal === undefined ? true : (isPublishedVal === 'true' || isPublishedVal === true);

    this.assertPlayableAudioUrl(audioUrl);

    const created = await this.prisma.podcastEpisodes.create({
      data: {
        Title: title || 'Untitled Episode',
        Description: description,
        AudioUrl: this.normalizeMediaUrl(audioUrl),
        CoverImageUrl: this.normalizeMediaUrl(coverImageUrl),
        DurationInSeconds: (parseInt(duration) || 0) * 60,
        PublishDate: publishDate ? new Date(publishDate) : new Date(),
        IsPublished: isPublished,
      },
    });

    return this.mapPodcastResponse(created);
  }

  async update(id: string, data: any) {
    if (String(id).startsWith('session-')) {
      const sessionId = parseInt(String(id).replace('session-', ''));
      const updateData: any = {};
      const title = data.title ?? data.Title;
      const audioUrl = data.audioUrl ?? data.AudioUrl;
      const coverImageUrl = data.coverImageUrl ?? data.CoverImageUrl;
      const publishDate = data.publishDate ?? data.PublishDate;
      if (title !== undefined) updateData.PatientName = title;
      if (audioUrl !== undefined) updateData.AudioUrl = audioUrl;
      if (coverImageUrl !== undefined) updateData.ImageUrl = coverImageUrl;
      if (publishDate !== undefined) updateData.ScheduledAt = new Date(publishDate);

      const updatedSession = await this.prisma.doctorSessions.update({
        where: { Id: sessionId },
        data: updateData,
      });

      return this.mapPodcastResponse({
        Id: id,
        Title: updatedSession.PatientName || `Doctor Podcast #${updatedSession.Id}`,
        Description: `Session with Doctor ID: ${updatedSession.DoctorId}`,
        AudioUrl: updatedSession.AudioUrl,
        CoverImageUrl: updatedSession.ImageUrl || '',
        DurationInSeconds: 0,
        PublishDate: updatedSession.ScheduledAt,
        IsPublished: true,
        Source: 'DoctorSession',
      });
    }

    const podcastId = parseInt(String(id));
    await this.findOne(id);
    
    const updateData: any = {};
    const title = data.title ?? data.Title;
    const description = data.description ?? data.Description;
    const audioUrl = data.audioUrl ?? data.AudioUrl;
    const coverImageUrl = data.coverImageUrl ?? data.CoverImageUrl;
    const duration = data.duration ?? data.Duration;
    const publishDate = data.publishDate ?? data.PublishDate;
    const isPublished = data.isPublished ?? data.IsPublished;

    if (title !== undefined) updateData.Title = title;
    if (description !== undefined) updateData.Description = description;
    if (audioUrl !== undefined) {
      this.assertPlayableAudioUrl(audioUrl);
      updateData.AudioUrl = this.normalizeMediaUrl(audioUrl);
    }
    if (coverImageUrl !== undefined) updateData.CoverImageUrl = this.normalizeMediaUrl(coverImageUrl);
    if (duration !== undefined) updateData.DurationInSeconds = (parseInt(duration) || 0) * 60;
    if (publishDate !== undefined) updateData.PublishDate = new Date(publishDate);
    if (isPublished !== undefined) updateData.IsPublished = isPublished === 'true' || isPublished === true;

    const updated = await this.prisma.podcastEpisodes.update({
      where: { Id: podcastId },
      data: updateData,
    });

    return this.mapPodcastResponse(updated);
  }

  async remove(id: string) {
    if (String(id).startsWith('session-')) {
      const sessionId = parseInt(String(id).replace('session-', ''));
      return this.prisma.doctorSessions.delete({
        where: { Id: sessionId },
      });
    }

    const podcastId = parseInt(String(id));
    return this.prisma.podcastEpisodes.delete({
      where: { Id: podcastId },
    });
  }
}
