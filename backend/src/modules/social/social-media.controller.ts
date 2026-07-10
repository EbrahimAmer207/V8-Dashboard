import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { basename, join, normalize } from 'path';
import { SocialService } from './social.service';

function resolveLocalImagePath(imageUrl: string) {
  const uploadsDir = join(process.cwd(), 'uploads');
  let normalized = imageUrl.trim();

  // Accept image paths with or without a leading slash, e.g. '/images/foo.jpg' or 'images/foo.jpg'
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  if (normalized.startsWith('/images/')) {
    return join(uploadsDir, 'posts', basename(normalized));
  }

  if (normalized.startsWith('/uploads/')) {
    const relative = normalized.replace(/^\/uploads\//, '');
    const candidate = normalize(join(uploadsDir, relative));
    return candidate.startsWith(uploadsDir) ? candidate : null;
  }

  return null;
}

@Controller('social/posts')
export class SocialMediaController {
  constructor(private readonly socialService: SocialService) {}

  @Get(':id/image')
  async getPostImage(@Param('id') id: string, @Res() res: Response) {
    const imageUrl = await this.socialService.getPostImageUrl(id);
    if (!imageUrl) {
      throw new NotFoundException('Post image was not found in the database.');
    }

    const normalized = imageUrl.trim();

    if (normalized.startsWith('data:image/')) {
      const [meta, data] = normalized.split(',');
      const contentType = meta.match(/^data:([^;]+);base64$/)?.[1] || 'image/png';
      res.type(contentType).send(Buffer.from(data || '', 'base64'));
      return;
    }

    if (/^https?:\/\//i.test(normalized)) {
      res.redirect(normalized);
      return;
    }

    const localPath = resolveLocalImagePath(normalized);
    if (localPath && existsSync(localPath)) {
      res.sendFile(localPath);
      return;
    }

    const mediaBaseUrl = (
      process.env.MEDIA_BASE_URL ||
      process.env.PUBLIC_MEDIA_URL ||
      ''
    ).replace(/\/$/, '');
    if (mediaBaseUrl && normalized.startsWith('/')) {
      res.redirect(`${mediaBaseUrl}${normalized}`);
      return;
    }

    throw new NotFoundException(
      'Post image path exists in the database, but the image file is not available on this server.',
    );
  }
}
