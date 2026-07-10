import { randomUUID } from 'crypto';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

export function resourceStorage() {
  return diskStorage({
    destination: (_req, _file, cb) => {
      const dir = join(process.cwd(), 'uploads', 'resources');
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
