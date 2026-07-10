import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminCompatService } from './admin-compat.service';
import { KnowledgeService } from '../knowledge/knowledge.service';

@UseGuards(JwtAuthGuard)
export class ProtectedCompatController {
  constructor(protected readonly service: AdminCompatService) {}
}

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsCompatController extends ProtectedCompatController {
  @Get()
  findAll(@Query() query: any) {
    return this.service.requests(query);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.service.requests({ search: q });
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.service.requests({ userId });
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string) {
    return this.service.requests({ status });
  }

  @Get('category/:category/:status')
  findByCategoryAndStatus(@Param('category') category: string, @Param('status') status: string) {
    return this.service.requests({ category, status });
  }

  @Get('stats')
  async stats() {
    const requests = await this.service.requests();
    return {
      total: requests.length,
      pending: requests.filter((item) => item.status === 'Pending').length,
      approved: requests.filter((item) => item.status === 'In Progress').length,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.request(id);
  }

  @Post()
  create(@Body() data: any) {
    // Basic mock creation or forward to service if needed
    return { ...data, id: Date.now().toString() };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.updateRequest(id, data);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() data: any) {
    return this.service.updateRequest(id, data);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approveRequest(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.rejectRequest(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteTicket(id);
  }
}

@Controller('cases')
@UseGuards(JwtAuthGuard)
export class CasesCompatController extends ProtectedCompatController {
  @Get()
  findAll(@Query() query: any) {
    return this.service.cases(query);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.service.cases({ search: q });
  }

  @Get('priority/:priority')
  findByPriority(@Param('priority') priority: string) {
    return this.service.cases({ priority });
  }

  @Get('stats')
  async stats() {
    const cases = await this.service.cases();
    return {
      total: cases.length,
      pending: cases.filter((item) => item.status === 'Pending').length,
      active: cases.filter((item) => item.status === 'In Progress').length,
      completed: cases.filter((item) => item.status === 'Completed').length,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.case(id);
  }

  @Post()
  create(@Body() data: any) {
    return { ...data, id: Date.now().toString() };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.updateCase(id, data);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() data: any) {
    return this.service.updateCase(id, data);
  }

  @Patch(':id/assign')
  assign(@Param('id') id: string) {
    return this.service.updateCase(id, {});
  }

  @Patch(':id/progress')
  progress(@Param('id') id: string) {
    return this.service.updateCase(id, {});
  }

  @Patch(':id/sla')
  sla(@Param('id') id: string) {
    return this.service.updateCase(id, {});
  }

  @Post(':id/notes')
  note(@Param('id') id: string) {
    return this.service.updateCase(id, {});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteTicket(id);
  }
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsCompatController extends ProtectedCompatController {
  @Get()
  findAll(@Query() query: any) {
    return this.service.notifications(query);
  }

  @Get('all')
  findAllSystem(@Query() query: any) {
    return this.service.notifications(query);
  }

  @Post('send')
  send() {
    return { message: 'Notification send endpoint is connected; delivery is handled by the main app.' };
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markNotificationRead(id);
  }

  @Patch('read-all')
  markAllRead() {
    return this.service.markAllNotificationsRead();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.deleteNotification(id);
  }
}

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesCompatController extends ProtectedCompatController {
  @Get()
  findAll() {
    return this.service.roles();
  }

  @Delete(':id')
  remove() {
    return { message: 'Role deletion is managed by the main backend.' };
  }
}

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsCompatController extends ProtectedCompatController {
  @Get()
  findAll() {
    return this.service.permissions();
  }
}

@Controller('logs')
@UseGuards(JwtAuthGuard)
export class LogsCompatController extends ProtectedCompatController {
  @Get()
  findAll(@Query() query: any) {
    return this.service.logs(query);
  }
}

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentCompatController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  findAll(@Query() query: any) {
    return this.knowledgeService.findAll(query);
  }

  @Get('stats')
  async stats() {
    const result = await this.knowledgeService.findAll({ limit: 1 });
    return { total: result.pagination.total };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.knowledgeService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.knowledgeService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.knowledgeService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.knowledgeService.delete(id);
  }
}
