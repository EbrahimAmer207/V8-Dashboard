import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  async conversations(@Request() req: any, @Query('limit') limit?: string) {
    return this.chatService.listConversations(req.user, Number(limit) || 80);
  }

  @Get('conversations/:conversationId/messages')
  async messages(
    @Request() req: any,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
  ) {
    return this.chatService.listMessages(req.user, conversationId, Number(limit) || 100);
  }

  @Post('messages')
  async send(@Request() req: any, @Body() body: any) {
    return this.chatService.sendMessage(req.user, {
      receiverId: body.receiverId,
      content: body.content,
      conversationId: body.conversationId,
      attachmentUrl: body.attachmentUrl,
      attachmentName: body.attachmentName,
    });
  }
}
