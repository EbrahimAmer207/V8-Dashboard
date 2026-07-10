import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  private mapResource(resource: any) {
    const category = resource.Type === 0 ? 'Article' : resource.Type === 1 ? 'Video' : 'PDF';

    return {
      id: String(resource.Id),
      title: resource.Title,
      content: resource.Description || '',
      category,
      status: 'published',
      viewCount: 0,
      createdAt: resource.CreatedDate?.toISOString?.() || resource.CreatedDate,
      updatedAt: resource.CreatedDate?.toISOString?.() || resource.CreatedDate,
      authorId: 'database',
      author: {
        id: 'database',
        firstName: 'Database',
        lastName: 'Resource',
      },
      url: resource.Url,
      coverImageUrl: resource.CoverImageUrl,
    };
  }

  async findAll(query: any) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit || 10)));
    const skip = (page - 1) * limit;
    const where: any = {};

    if (query.search) {
      where.OR = [
        { Title: { contains: query.search } },
        { Description: { contains: query.search } },
      ];
    }

    if (query.category) {
      const typeMap: Record<string, number> = { Article: 0, Video: 1, PDF: 2 };
      if (typeMap[query.category] !== undefined) where.Type = typeMap[query.category];
    }

    const [resources, total] = await Promise.all([
      this.prisma.resources.findMany({
        where,
        skip,
        take: limit,
        orderBy: { CreatedDate: 'desc' },
      }),
      this.prisma.resources.count({ where }),
    ]);

    return {
      data: resources.map((resource) => this.mapResource(resource)),
      pagination: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string) {
    const resource = await this.prisma.resources.findUnique({
      where: { Id: Number(id) },
    });

    if (!resource) throw new NotFoundException('Knowledge item not found');
    return this.mapResource(resource);
  }

  async create(data: any) {
    const resource = await this.prisma.resources.create({
      data: {
        Title: data.title,
        Description: data.content || data.description || '',
        Type: this.typeFromCategory(data.category),
        Url: data.url?.trim() || null,
        CoverImageUrl: data.coverImageUrl?.trim() || null,
        CreatedDate: new Date(),
      },
    });

    return this.mapResource(resource);
  }

  async update(id: string, data: any) {
    await this.findOne(id);

    const updateData: any = {};
    if (data.title !== undefined) updateData.Title = data.title;
    if (data.content !== undefined) updateData.Description = data.content;
    if (data.description !== undefined) updateData.Description = data.description;
    if (data.category !== undefined) updateData.Type = this.typeFromCategory(data.category);
    if (data.url !== undefined) updateData.Url = data.url?.trim() || null;
    if (data.coverImageUrl !== undefined) updateData.CoverImageUrl = data.coverImageUrl?.trim() || null;

    const resource = await this.prisma.resources.update({
      where: { Id: Number(id) },
      data: updateData,
    });

    return this.mapResource(resource);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.resources.delete({ where: { Id: Number(id) } });
    return { message: 'Knowledge item deleted' };
  }

  private typeFromCategory(category?: string) {
    const typeMap: Record<string, number> = { Article: 0, Video: 1, PDF: 2 };
    return typeMap[category || 'Article'] ?? 0;
  }
}
