import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const STAFF_ROLES = new Set(['ADMIN', 'MODERATOR', 'SUPPORT']);

type ChatUser = {
  id: string;
  email: string | null;
  username: string | null;
  name: string;
  avatar: string | null;
  role: string;
  type: 'PROVIDER' | 'SEEKER';
};

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  private isStaff(user: any) {
    return STAFF_ROLES.has(user?.role);
  }

  private mapUser(user: any): ChatUser {
    return {
      id: user.Id,
      email: user.Email,
      username: user.UserName,
      name: user.FullName || user.Email || 'Unknown user',
      avatar: user.AvatarUrl || null,
      role: user.AspNetUserRoles?.[0]?.AspNetRoles?.Name || 'USER',
      type: user.Doctors?.length ? 'PROVIDER' : 'SEEKER',
    };
  }

  private async getUsersById(ids: string[]) {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    if (!uniqueIds.length) return new Map<string, ChatUser>();

    const users = await this.prisma.aspNetUsers.findMany({
      where: { Id: { in: uniqueIds } },
      include: {
        Doctors: true,
        Patients: true,
        AspNetUserRoles: { include: { AspNetRoles: true } },
      },
    });

    return new Map(users.map((user) => [user.Id, this.mapUser(user)]));
  }

  async listConversations(user: any, limit = 80) {
    const take = Math.min(Math.max(limit, 1), 200);
    const staff = this.isStaff(user);

    const messages = await this.prisma.messages.findMany({
      where: staff
        ? {}
        : {
            OR: [{ SenderId: user.id }, { ReceiverId: user.id }],
          },
      orderBy: { SentAt: 'desc' },
      take: take * 12,
    });

    const grouped = new Map<string, any>();
    for (const message of messages) {
      if (!grouped.has(message.ConversationId)) {
        grouped.set(message.ConversationId, message);
      }
      if (grouped.size >= take) break;
    }

    const latestMessages = [...grouped.values()];
    const participantIds = latestMessages.flatMap((message) => [message.SenderId, message.ReceiverId]);
    const userById = await this.getUsersById(participantIds);

    const unreadCounts = await Promise.all(
      latestMessages.map((message) =>
        this.prisma.messages.count({
          where: {
            ConversationId: message.ConversationId,
            ReceiverId: user.id,
            IsRead: false,
          },
        }),
      ),
    );

    return {
      data: latestMessages.map((message, index) => {
        const otherId = message.SenderId === user.id ? message.ReceiverId : message.SenderId;
        const otherParticipant = userById.get(otherId) || userById.get(message.SenderId) || userById.get(message.ReceiverId);

        return {
          id: message.ConversationId,
          latestMessage: {
            id: message.Id,
            content: message.Content,
            sentAt: message.SentAt,
            senderId: message.SenderId,
            receiverId: message.ReceiverId,
            attachmentUrl: message.AttachmentUrl,
          },
          otherParticipant,
          participants: [userById.get(message.SenderId), userById.get(message.ReceiverId)].filter(Boolean),
          unreadCount: unreadCounts[index],
        };
      }),
    };
  }

  async listMessages(user: any, conversationId: string, limit = 100) {
    const take = Math.min(Math.max(limit, 1), 300);
    const staff = this.isStaff(user);

    const participantMessage = await this.prisma.messages.findFirst({
      where: {
        ConversationId: conversationId,
        OR: [{ SenderId: user.id }, { ReceiverId: user.id }],
      },
    });

    if (!staff && !participantMessage) {
      throw new ForbiddenException('You do not have access to this conversation');
    }

    const messages = await this.prisma.messages.findMany({
      where: { ConversationId: conversationId },
      orderBy: { SentAt: 'asc' },
      take,
    });

    if (!messages.length) {
      throw new NotFoundException('Conversation not found');
    }

    await this.prisma.messages.updateMany({
      where: { ConversationId: conversationId, ReceiverId: user.id, IsRead: false },
      data: { IsRead: true },
    });

    const userById = await this.getUsersById(messages.flatMap((message) => [message.SenderId, message.ReceiverId]));

    return {
      data: messages.map((message) => ({
        id: message.Id,
        conversationId: message.ConversationId,
        content: message.Content,
        sentAt: message.SentAt,
        isRead: message.IsRead,
        senderId: message.SenderId,
        receiverId: message.ReceiverId,
        sender: userById.get(message.SenderId),
        receiver: userById.get(message.ReceiverId),
        attachmentName: message.AttachmentName,
        attachmentUrl: message.AttachmentUrl,
        messageType: message.MessageType,
      })),
    };
  }

  async sendMessage(
    user: any,
    data: {
      receiverId?: string;
      content?: string;
      conversationId?: string;
      attachmentUrl?: string;
      attachmentName?: string;
    },
  ) {
    const receiverId = data.receiverId?.trim();
    const content = data.content?.trim();

    if (!receiverId) throw new BadRequestException('receiverId is required');
    if (!content && !data.attachmentUrl) throw new BadRequestException('Message content or attachment is required');
    if (receiverId === user.id) throw new BadRequestException('Cannot send a message to yourself');

    const receiver = await this.prisma.aspNetUsers.findUnique({ where: { Id: receiverId } });
    if (!receiver) throw new NotFoundException('Receiver not found');

    const existingConversation = data.conversationId
      ? await this.prisma.messages.findFirst({ where: { ConversationId: data.conversationId } })
      : await this.prisma.messages.findFirst({
          where: {
            OR: [
              { SenderId: user.id, ReceiverId: receiverId },
              { SenderId: receiverId, ReceiverId: user.id },
            ],
          },
          orderBy: { SentAt: 'desc' },
        });

    const conversationId =
      data.conversationId || existingConversation?.ConversationId || `chat:${[user.id, receiverId].sort().join(':')}`;

    const message = await this.prisma.messages.create({
      data: {
        SenderId: user.id,
        ReceiverId: receiverId,
        Content: content || null,
        SentAt: new Date(),
        IsRead: false,
        ConversationId: conversationId,
        AttachmentName: data.attachmentName || null,
        AttachmentUrl: data.attachmentUrl || null,
        MessageType: data.attachmentUrl ? 1 : 0,
      },
    });

    return {
      id: message.Id,
      conversationId: message.ConversationId,
      content: message.Content,
      sentAt: message.SentAt,
      senderId: message.SenderId,
      receiverId: message.ReceiverId,
    };
  }
}
