import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PodcastsService } from './podcasts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  PODCAST_UPLOAD_LIMITS,
  podcastMediaFilter,
  podcastMediaStorage,
} from './podcast-upload.config';

@Controller('podcasts')
@UseGuards(JwtAuthGuard)
export class PodcastsController {
  constructor(private readonly podcastsService: PodcastsService) {}

  @Get()
  async findAll(@Query('includeSessions') includeSessions?: string) {
    return this.podcastsService.findAll(includeSessions === 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.podcastsService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'File', maxCount: 1 },
        { name: 'file', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
        { name: 'Cover', maxCount: 1 },
      ],
      {
        storage: podcastMediaStorage(),
        fileFilter: podcastMediaFilter,
        limits: PODCAST_UPLOAD_LIMITS,
      },
    ),
  )
  async create(
    @UploadedFiles()
    files: {
      audio?: Express.Multer.File[];
      File?: Express.Multer.File[];
      file?: Express.Multer.File[];
      cover?: Express.Multer.File[];
      Cover?: Express.Multer.File[];
    },
    @Body() data: any,
  ) {
    const audio = files?.audio?.[0] || files?.File?.[0] || files?.file?.[0];
    const cover = files?.cover?.[0] || files?.Cover?.[0];
    
    let remoteAudioUrl: string | undefined;
    let remoteCoverUrl: string | undefined;

    try {
      const syncResult: any = await this.podcastsService.createRemoteDoctorSessionPodcast(data, { audio, cover });
      if (syncResult) {
        remoteAudioUrl = syncResult.audioUrl || syncResult.AudioUrl || syncResult.fileUrl || syncResult.FileUrl;
        remoteCoverUrl = syncResult.imageUrl || syncResult.ImageUrl || syncResult.coverImageUrl || syncResult.CoverImageUrl;
      }
    } catch (err) {
      console.warn('Failed to sync to remote doctor sessions:', err);
    }

    return this.podcastsService.create({
      ...data,
      audioUrl: remoteAudioUrl || (audio ? `/uploads/podcasts/audio/${audio.filename}` : data.audioUrl),
      coverImageUrl: remoteCoverUrl || (cover ? `/uploads/podcasts/covers/${cover.filename}` : data.coverImageUrl),
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.podcastsService.update(id, data);
  }

  @Put(':id/with-media')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
      ],
      {
        storage: podcastMediaStorage(),
        fileFilter: podcastMediaFilter,
        limits: PODCAST_UPLOAD_LIMITS,
      },
    ),
  )
  async updateWithMedia(
    @Param('id') id: string,
    @UploadedFiles()
    files: {
      audio?: Express.Multer.File[];
      cover?: Express.Multer.File[];
    },
    @Body() data: any,
  ) {
    const audio = files?.audio?.[0];
    const cover = files?.cover?.[0];
    return this.podcastsService.update(id, {
      ...data,
      ...(audio ? { audioUrl: `/uploads/podcasts/audio/${audio.filename}` } : {}),
      ...(cover ? { coverImageUrl: `/uploads/podcasts/covers/${cover.filename}` } : {}),
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.podcastsService.remove(id);
  }
}
