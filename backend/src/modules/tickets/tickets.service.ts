import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = search
      ? {
          OR: [
            { Subject: { contains: search } },
            { Message: { contains: search } },
          ],
        }
      : {};

    const [tickets, total] = await Promise.all([
      this.prisma.supportTickets.findMany({
        where,
        skip,
        take: limit,
        orderBy: { CreatedAt: 'desc' },
        include: {
          AspNetUsers: {
            select: { FullName: true, Email: true, AvatarUrl: true },
          },
        },
      }),
      this.prisma.supportTickets.count({ where }),
    ]);

    return {
      data: tickets.map((t) => ({
        id: t.Id,
        subject: t.Subject,
        message: t.Message,
        status: t.Status,
        createdAt: t.CreatedAt,
        user: {
          name: t.AspNetUsers?.FullName || 'Unknown',
          email: t.AspNetUsers?.Email || '',
          avatar: t.AspNetUsers?.AvatarUrl || null,
        },
      })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const ticket = await this.prisma.supportTickets.findUnique({
      where: { Id: parseInt(id) },
      include: {
        AspNetUsers: {
          select: { FullName: true, Email: true, AvatarUrl: true },
        },
      },
    });
    if (!ticket) return null;
    return {
      id: ticket.Id,
      subject: ticket.Subject,
      message: ticket.Message,
      status: ticket.Status,
      createdAt: ticket.CreatedAt,
      userId: ticket.UserId,
      user: {
        name: ticket.AspNetUsers?.FullName || 'Unknown',
        email: ticket.AspNetUsers?.Email || '',
      },
    };
  }

  async create(data: { userId: string; subject: string; message: string }) {
    const ticket = await this.prisma.supportTickets.create({
      data: {
        UserId: data.userId,
        Subject: data.subject,
        Message: data.message,
        Status: 'Open',
        CreatedAt: new Date(),
      },
    });
    return { id: ticket.Id, subject: ticket.Subject, status: ticket.Status };
  }

  async update(id: string, data: { status?: string; subject?: string; message?: string }) {
    const updateData: any = {};
    if (data.status) updateData.Status = data.status;
    if (data.subject) updateData.Subject = data.subject;
    if (data.message) updateData.Message = data.message;

    return this.prisma.supportTickets.update({
      where: { Id: parseInt(id) },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.prisma.supportTickets.delete({ where: { Id: parseInt(id) } });
    return { message: 'Ticket deleted successfully' };
  }
}
