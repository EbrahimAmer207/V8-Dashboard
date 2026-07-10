import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSocialPostDto } from './dto/create-post.dto';
import {
  SOCIAL_POST_UPLOAD_LIMITS,
  socialPostImageFilter,
  socialPostImageStorage,
} from './social-upload.config';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get('feed')
  async getFeed() {
    return this.socialService.getFeed();
  }

  /** JSON body: `{ content, imageUrl? }` — keeps mobile / existing clients working. */
  @Post('posts')
  async createPostJson(
    @Body() body: CreateSocialPostDto,
    @Request() req: { user: { id: string } },
  ) {
    const content = (body.content ?? '').trim();
    if (!content) {
      throw new BadRequestException('Content is required');
    }
    const imageUrl =
      body.imageUrl?.trim() || body.image?.trim() || undefined;
    return this.socialService.createPost(req.user.id, content, imageUrl);
  }

  /** Multipart form: fields `content`, optional `imageUrl`; file field `image`. */
  @Post('posts/with-media')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: socialPostImageStorage(),
      fileFilter: socialPostImageFilter,
      limits: SOCIAL_POST_UPLOAD_LIMITS,
    }),
  )
  async createPostWithMedia(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: CreateSocialPostDto,
    @Request() req: { user: { id: string } },
  ) {
    const content = (body.content ?? '').trim();
    if (!content) {
      throw new BadRequestException('Content is required');
    }
    const fromBody = body.imageUrl?.trim() || body.image?.trim() || undefined;
    const imageUrl = file ? `/images/${file.filename}` : fromBody;
    return this.socialService.createPost(req.user.id, content, imageUrl);
  }

  @Post('posts/:id/comments')
  async addComment(@Param('id') postId: string, @Body('content') content: string, @Request() req: any) {
    return this.socialService.addComment(postId, req.user.id, content);
  }

  @Post('posts/:id/like')
  async toggleLike(@Param('id') postId: string, @Request() req: any) {
    return this.socialService.toggleLike(postId, req.user.id);
  }

  @Put('posts/:id')
  async updatePost(@Param('id') id: string, @Body() data: any) {
    return this.socialService.updatePost(id, data);
  }

  @Delete('posts/:id')
  async deletePost(@Param('id') id: string) {
    return this.socialService.deletePost(id);
  }

  // Keep POST alias for backward compatibility
  @Post('posts/:id/delete')
  async deletePostAlias(@Param('id') id: string) {
    return this.socialService.deletePost(id);
  }
}
