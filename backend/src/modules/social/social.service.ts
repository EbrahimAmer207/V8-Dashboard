import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  async getFeed() {
    const posts = await this.prisma.posts.findMany({
      orderBy: { CreatedAt: 'desc' },
      include: {
        AspNetUsers: {
          select: {
            Id: true,
            FullName: true,
            AvatarUrl: true,
            Email: true
          }
        },
        _count: {
          select: {
            Comments: true,
            Likes: true
          }
        }
      }
    });

    // Map to the frontend format
    return posts.map(p => ({
      id: p.Id,
      content: p.Content,
      imageUrl: p.ImageUrl,
      createdAt: p.CreatedAt,
      authorId: p.UserId,
      author: {
        id: p.AspNetUsers.Id,
        firstName: p.AspNetUsers.FullName.split(' ')[0],
        lastName: p.AspNetUsers.FullName.split(' ').slice(1).join(' ') || '',
        avatar: p.AspNetUsers.AvatarUrl,
        email: p.AspNetUsers.Email
      },
      _count: {
        likes: p.LikesCount || p._count.Likes,
        comments: p.CommentsCount || p._count.Comments
      }
    }));
  }

  async createPost(authorId: string, content: string, image?: string) {
    return this.prisma.posts.create({
      data: {
        UserId: authorId,
        Content: content,
        ImageUrl: image,
        CreatedAt: new Date(),
        CommentsCount: 0,
        SharesCount: 0,
        LikesCount: 0
      }
    });
  }

  async getPostImageUrl(id: string) {
    const post = await this.prisma.posts.findUnique({
      where: { Id: parseInt(id, 10) },
      select: { ImageUrl: true },
    });

    return post?.ImageUrl || null;
  }

  async addComment(postId: string, userId: string, content: string) {
    return this.prisma.comments.create({
      data: {
        PostId: parseInt(postId),
        UserId: userId,
        Content: content,
        CreatedAt: new Date()
      }
    });
  }

  async toggleLike(postId: string, userId: string) {
    const existing = await this.prisma.likes.findFirst({
      where: { PostId: parseInt(postId), UserId: userId }
    });

    if (existing) {
      return this.prisma.likes.delete({ where: { Id: existing.Id } });
    }

    return this.prisma.likes.create({
      data: { PostId: parseInt(postId), UserId: userId }
    });
  }

  async updatePost(id: string, data: any) {
    const updateData: any = {};
    if (data.content !== undefined) updateData.Content = data.content;
    if (data.imageUrl !== undefined) updateData.ImageUrl = data.imageUrl;
    updateData.UpdatedAt = new Date();

    return this.prisma.posts.update({
      where: { Id: parseInt(id) },
      data: updateData
    });
  }

  async deletePost(id: string) {
    const postId = parseInt(id, 10);
    await this.prisma.$transaction([
      this.prisma.comments.deleteMany({ where: { PostId: postId } }),
      this.prisma.likes.deleteMany({ where: { PostId: postId } }),
      this.prisma.posts.delete({ where: { Id: postId } }),
    ]);
    return { deleted: true, id: postId };
  }
}
