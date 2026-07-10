import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const parsed = Number(process.env.MAX_PODCAST_UPLOAD_BYTES || process.env.MAX_UPLOAD_BYTES);
const MAX_BYTES =
  Number.isFinite(parsed) && parsed > 0 ? parsed : 50 * 1024 * 1024;

const AUDIO_FIELDS = ['audio', 'File', 'file'];
const COVER_FIELDS = ['cover', 'Cover'];

export function podcastMediaStorage() {
  return diskStorage({
    destination: (_req, file, cb) => {
      const folder = COVER_FIELDS.includes(file.fieldname) ? 'covers' : 'audio';
      const dir = join(process.cwd(), 'uploads', 'podcasts', folder);
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

export function podcastMediaFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  const isAudio = AUDIO_FIELDS.includes(file.fieldname) && /^audio\/(mpeg|mp3|mp4|aac|wav|ogg|webm|x-wav|x-m4a)$/i.test(file.mimetype);
  const isCover = COVER_FIELDS.includes(file.fieldname) && /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);

  if (!isAudio && !isCover) {
    cb(
      new BadRequestException(
        'Invalid podcast media. Use an audio file (mp3, m4a, wav, ogg) for the audio field.',
      ),
      false,
    );
    return;
  }

  cb(null, true);
}

export const PODCAST_UPLOAD_LIMITS = { fileSize: MAX_BYTES };
