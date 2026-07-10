import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const parsed = Number(process.env.MAX_FILE_SIZE || process.env.MAX_UPLOAD_BYTES);
const MAX_BYTES =
  Number.isFinite(parsed) && parsed > 0 ? parsed : 5 * 1024 * 1024;

export function socialPostImageStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const dir = join(process.cwd(), 'uploads', 'posts');
      mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname || '').toLowerCase();
      const safe =
        ext && ext.length <= 8 && /^\.[a-z0-9]+$/i.test(ext) ? ext : '.bin';
      cb(null, `${randomUUID()}${safe}`);
    },
  });
}

export function socialPostImageFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  const ok = /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype);
  if (!ok) {
    cb(
      new BadRequestException(
        'Invalid image type. Use JPEG, PNG, GIF, or WebP.',
      ),
      false,
    );
    return;
  }
  cb(null, true);
}

export const SOCIAL_POST_UPLOAD_LIMITS = { fileSize: MAX_BYTES };
