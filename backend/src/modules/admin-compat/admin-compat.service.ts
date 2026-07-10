import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminCompatService {
  constructor(private readonly prisma: PrismaService) {}

  private mapTicket(ticket: any) {
    const statusMap: Record<string, string> = {
      Open: 'Pending',
      Accepted: 'In Progress',
      Approved: 'In Progress',
      Closed: 'Completed',
      Rejected: 'Rejected',
    };
    const status = statusMap[ticket.Status] || ticket.Status || 'Pending';
    const priority = /urgent|critical|emergency/i.test(`${ticket.Subject} ${ticket.Message}`)
      ? 'Critical'
      : /high/i.test(`${ticket.Subject} ${ticket.Message}`)
        ? 'High'
        : 'Medium';
    const userName = ticket.AspNetUsers?.FullName || 'Unknown user';

    return {
      id: String(ticket.Id),
      title: ticket.Subject,
      subject: ticket.Subject,
      message: ticket.Message,
      type: 'Service',
      priority,
      status,
      user: userName,
      submittedAt: ticket.CreatedAt,
      createdAt: ticket.CreatedAt,
      assignedTo: null,
      userId: ticket.UserId,
      userDetails: {
        firstName: userName.split(' ')[0] || 'Unknown',
        lastName: userName.split(' ').slice(1).join(' '),
        email: ticket.AspNetUsers?.Email || '',
        avatar: ticket.AspNetUsers?.AvatarUrl || null,
      },
    };
  }

  private mapCase(ticket: any) {
    const item = this.mapTicket(ticket);
    return {
      ...item,
      caseNumber: `CASE-${String(ticket.Id).padStart(5, '0')}`,
      assignedAdmin: null,
      progress: item.status === 'Completed' ? 100 : item.status === 'In Progress' ? 45 : 0,
    };
  }

  async requests(query: any = {}) {
    const tickets = await this.findTickets(query);
    return tickets.map((ticket) => this.mapTicket(ticket));
  }

  async request(id: string) {
    const ticket = await this.findTicket(id);
    return this.mapTicket(ticket);
  }

  async updateRequest(id: string, data: any) {
    const updated = await this.prisma.supportTickets.update({
      where: { Id: Number(id) },
      data: this.ticketUpdateData(data),
      include: { AspNetUsers: { select: { FullName: true, Email: true, AvatarUrl: true } } },
    });
    return this.mapTicket(updated);
  }

  async approveRequest(id: string) {
    return this.updateRequest(id, { status: 'Approved' });
  }

  async rejectRequest(id: string) {
    return this.updateRequest(id, { status: 'Rejected' });
  }

  async cases(query: any = {}) {
    const tickets = await this.findTickets(query);
    return tickets.map((ticket) => this.mapCase(ticket));
  }

  async case(id: string) {
    const ticket = await this.findTicket(id);
    return this.mapCase(ticket);
  }

  async updateCase(id: string, data: any) {
    const updated = await this.prisma.supportTickets.update({
      where: { Id: Number(id) },
      data: this.ticketUpdateData(data),
      include: { AspNetUsers: { select: { FullName: true, Email: true, AvatarUrl: true } } },
    });
    return this.mapCase(updated);
  }

  async deleteTicket(id: string) {
    await this.prisma.supportTickets.delete({ where: { Id: Number(id) } });
    return { message: 'Deleted successfully' };
  }

  async roles() {
    const roles = await this.prisma.aspNetRoles.findMany({ orderBy: { Name: 'asc' } });
    return roles.map((role) => ({
      id: role.Id,
      name: role.Name || role.NormalizedName || 'Unnamed',
      description: `${role.Name || 'Role'} role from ASP.NET Identity`,
      permissions: [],
    }));
  }

  async permissions() {
    return [
      { id: 'users.read', resource: 'users', action: 'read' },
      { id: 'users.write', resource: 'users', action: 'write' },
      { id: 'content.write', resource: 'content', action: 'write' },
      { id: 'sessions.manage', resource: 'sessions', action: 'manage' },
    ];
  }

  async notifications(query: any = {}) {
    const limit = Math.min(100, Number(query.limit || 50));
    return this.prisma.notifications.findMany({
      take: limit,
      orderBy: { CreatedAt: 'desc' },
    });
  }

  async markNotificationRead(id: string) {
    return this.prisma.notifications.update({
      where: { Id: Number(id) },
      data: { IsRead: true },
    });
  }

  async markAllNotificationsRead() {
    await this.prisma.notifications.updateMany({ data: { IsRead: true } });
    return { message: 'Notifications marked as read' };
  }

  async deleteNotification(id: string) {
    await this.prisma.notifications.delete({ where: { Id: Number(id) } });
    return { message: 'Notification deleted' };
  }

  async logs(query: any = {}) {
    const limit = Math.min(100, Number(query.limit || 50));
    const tickets = await this.findTickets({ limit });
    return tickets.map((ticket) => ({
      id: `ticket-${ticket.Id}`,
      type: 'VIEW',
      resource: 'support-ticket',
      resourceId: String(ticket.Id),
      description: `Support ticket: ${ticket.Subject}`,
      userId: ticket.UserId,
      user: { username: ticket.AspNetUsers?.FullName || 'System' },
      createdAt: ticket.CreatedAt,
    }));
  }

  private async findTickets(query: any = {}) {
    const limit = Math.min(100, Number(query.limit || 50));
    const where: any = {};
    if (query.search || query.q) {
      const search = query.search || query.q;
      where.OR = [{ Subject: { contains: search } }, { Message: { contains: search } }];
    }
    if (query.status && query.status !== 'all') {
      where.Status = this.toTicketStatus(query.status);
    }
    return this.prisma.supportTickets.findMany({
      where,
      take: limit,
      orderBy: { CreatedAt: 'desc' },
      include: { AspNetUsers: { select: { FullName: true, Email: true, AvatarUrl: true } } },
    });
  }

  private async findTicket(id: string) {
    const ticket = await this.prisma.supportTickets.findUnique({
      where: { Id: Number(id) },
      include: { AspNetUsers: { select: { FullName: true, Email: true, AvatarUrl: true } } },
    });
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  private ticketUpdateData(data: any) {
    const updateData: any = {};
    if (data.status) updateData.Status = this.toTicketStatus(data.status);
    if (data.title || data.subject) updateData.Subject = data.title || data.subject;
    if (data.message) updateData.Message = data.message;
    return updateData;
  }

  private toTicketStatus(status: string) {
    const normalized = String(status).toLowerCase();
    if (normalized === 'pending') return 'Open';
    if (normalized === 'in progress') return 'Accepted';
    if (normalized === 'completed') return 'Closed';
    if (normalized === 'approved') return 'Approved';
    if (normalized === 'rejected') return 'Rejected';
    return status;
  }
}
