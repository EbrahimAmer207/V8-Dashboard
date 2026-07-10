import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { SocialMediaController } from './social-media.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SocialController, SocialMediaController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
