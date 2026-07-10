import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { readFile } from 'fs/promises';

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name);

  constructor(private prisma: PrismaService) {}

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
        this.logger.error(`Dynamic production login failed for resources: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.token || data.data?.accessToken || data.accessToken || null;
    } catch (err) {
      this.logger.error('Failed to get dynamic production token for resources', err);
      return null;
    }
  }

  async uploadResourceToProduction(file: Express.Multer.File): Promise<string | null> {
    const baseUrl = 'http://e7nama3ak.runasp.net';
    const patientId = '1';

    this.logger.log('Acquiring dynamic token for resource production sync...');
    const token = await this.getDynamicProductionToken();
    if (!token) {
      this.logger.warn('Failed to obtain production token. Falling back to local resource path.');
      return null;
    }

    const form = new FormData();
    form.set('SessionType', 'Podcast'); // C# DoctorSessions endpoint accepts Podcast/Video
    form.set('ScheduledAt', new Date().toISOString());
    form.set('Price', '0');
    form.set('AudioUrl', '');
    form.set('ImageUrl', '');

    try {
      const fileBuffer = await readFile(file.path);
      form.set(
        'MediaFile',
        new Blob([fileBuffer], { type: file.mimetype || 'application/octet-stream' }),
        file.originalname || file.filename,
      );

      this.logger.log(`Uploading resource file (${file.originalname}) to production C# API...`);
      const response = await fetch(`${baseUrl}/api/DoctorSessions/${patientId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '')}`,
        },
        body: form,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        this.logger.warn(`Resource production upload failed: Status ${response.status}. Response: ${text}`);
        return null;
      }

      this.logger.log('Successfully uploaded resource file to production! Querying DB for hosted path...');
      
      // Query DB immediately for the latest DoctorSession to get the real hosted file URL.
      const latestSession = await this.prisma.doctorSessions.findFirst({
        orderBy: { Id: 'desc' },
        select: { Id: true, AudioUrl: true, ImageUrl: true },
      });

      const hostedUrl = latestSession?.AudioUrl || latestSession?.ImageUrl;
      if (hostedUrl) {
        this.logger.log(`Resolved resource production URL: ${hostedUrl}`);
        return hostedUrl;
      }

      return null;
    } catch (err) {
      this.logger.error('Failed to sync resource to remote production C# API', err);
      return null;
    }
  }

  private mapResourceResponse(item: any) {
    if (!item) return null;

    const typeMapInv: Record<number, string> = { 0: 'Article', 1: 'Video', 2: 'Pdf' };
    const typeStr = typeMapInv[item.Type] ?? 'Article';

    return {
      // PascalCase (backend native)
      Id: item.Id,
      Title: item.Title,
      Description: item.Description,
      CoverImageUrl: item.CoverImageUrl,
      Type: item.Type, // Integer (0, 1, 2)
      Url: item.Url,
      Duration: item.Duration,
      FileSize: item.FileSize,
      CreatedDate: item.CreatedDate,

      // camelCase (frontend & mobile compatibility)
      id: item.Id,
      title: item.Title,
      description: item.Description,
      coverImageUrl: item.CoverImageUrl,
      type: item.Type, // Send as Integer for mobile parser compatibility
      typeStr: typeStr, // Send as String 'Article', 'Video', or 'Pdf'
      fileUrl: item.Url, // Frontend expects fileUrl
      duration: item.Duration,
      fileSize: item.FileSize,
      createdDate: item.CreatedDate?.toISOString() || new Date().toISOString(),
    };
  }

  async findAll() {
    const items = await this.prisma.resources.findMany({
      orderBy: { CreatedDate: 'desc' },
    });
    return items.map((item) => this.mapResourceResponse(item));
  }

  async create(data: any, file?: Express.Multer.File) {
    const typeMap: Record<string, number> = { Article: 0, Video: 1, PDF: 2 };
    
    // Ignore dummy empty files sent by the frontend
    const isDummyFile = file && (file.originalname === 'empty.txt' || file.size === 0);
    const realFile = file && !isDummyFile ? file : undefined;

    let fileUrl = realFile ? `/uploads/resources/${realFile.filename}` : null;

    // Attempt to sync real file to production C# API if available
    if (realFile) {
      const syncedUrl = await this.uploadResourceToProduction(realFile);
      if (syncedUrl) {
        fileUrl = syncedUrl;
      }
    }

    if (!fileUrl) {
      fileUrl = data.url ?? data.Url ?? data.fileUrl ?? data.FileUrl ?? null;
    }

    const title = data.title ?? data.Title;
    const description = data.description ?? data.content ?? data.Description ?? null;
    const coverImageUrl = data.coverImageUrl ?? data.CoverImageUrl ?? null;
    const duration = data.duration ?? data.Duration ?? null;
    const fileSize = realFile ? realFile.size : (data.fileSize ?? data.FileSize ?? null);

    let typeInt = 0;
    const inputType = data.type ?? data.Type ?? data.category ?? data.Category;
    if (inputType !== undefined) {
      if (typeof inputType === 'string') {
        typeInt = typeMap[inputType] ?? parseInt(inputType) ?? 0;
      } else {
        typeInt = Number(inputType) || 0;
      }
    }

    const created = await this.prisma.resources.create({
      data: {
        Title: title || 'Untitled Resource',
        Description: description || '',
        CoverImageUrl: coverImageUrl || '/uploads/default-cover.jpg',
        Type: typeInt,
        Url: fileUrl || '',
        Duration: duration ? parseInt(String(duration)) : 0,
        FileSize: fileSize ? parseFloat(String(fileSize)) : 0,
        CreatedDate: data.createdDate ? new Date(data.createdDate) : new Date(),
      },
    });

    return this.mapResourceResponse(created);
  }

  async update(id: string, data: any, file?: Express.Multer.File) {
    const resourceId = parseInt(id);
    const existing = await this.prisma.resources.findUnique({
      where: { Id: resourceId },
    });
    if (!existing) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    const isDummyFile = file && (file.originalname === 'empty.txt' || file.size === 0);
    const realFile = file && !isDummyFile ? file : undefined;

    const updateData: any = {};
    if (data.title !== undefined || data.Title !== undefined) {
      updateData.Title = data.title ?? data.Title;
    }
    if (data.description !== undefined || data.Description !== undefined || data.content !== undefined) {
      updateData.Description = data.description ?? data.Description ?? data.content ?? '';
    }
    if (data.coverImageUrl !== undefined || data.CoverImageUrl !== undefined) {
      updateData.CoverImageUrl = data.coverImageUrl ?? data.CoverImageUrl ?? '/uploads/default-cover.jpg';
    }
    if (data.duration !== undefined || data.Duration !== undefined) {
      updateData.Duration = data.duration ? parseInt(String(data.duration ?? data.Duration)) : 0;
    }

    if (realFile) {
      let fileUrl = `/uploads/resources/${realFile.filename}`;
      const syncedUrl = await this.uploadResourceToProduction(realFile);
      if (syncedUrl) {
        fileUrl = syncedUrl;
      }
      updateData.Url = fileUrl;
      updateData.FileSize = realFile.size;
    } else if (data.url !== undefined || data.Url !== undefined || data.fileUrl !== undefined || data.FileUrl !== undefined) {
      updateData.Url = data.url ?? data.Url ?? data.fileUrl ?? data.FileUrl ?? '';
    }

    const inputType = data.type ?? data.Type ?? data.category ?? data.Category;
    if (inputType !== undefined) {
      const typeMap: Record<string, number> = { Article: 0, Video: 1, PDF: 2 };
      if (typeof inputType === 'string') {
        updateData.Type = typeMap[inputType] ?? parseInt(inputType) ?? 0;
      } else {
        updateData.Type = Number(inputType) || 0;
      }
    }

    const updated = await this.prisma.resources.update({
      where: { Id: resourceId },
      data: updateData,
    });

    return this.mapResourceResponse(updated);
  }

  async delete(id: string) {
    const resourceId = parseInt(id);
    try {
      const deleted = await this.prisma.resources.delete({
        where: { Id: resourceId },
      });
      return this.mapResourceResponse(deleted);
    } catch (err) {
      this.logger.log(`Resource with ID ${id} was already deleted or not found.`);
      return { id: resourceId, deleted: true };
    }
  }
}
