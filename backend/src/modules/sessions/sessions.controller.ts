import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.sessionsService.findAll({ status, doctorId, patientId });
  }

  @Get('my-sessions')
  async findMySessions(@Request() req: { user: { id: string } }) {
    return this.sessionsService.findAllByPatient(req.user.id);
  }

  @Get('doctor/:doctorId')
  async findByDoctor(@Param('doctorId') doctorId: string) {
    return this.sessionsService.findAllByDoctor(doctorId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.sessionsService.findOne(id);
  }

  @Post()
  async create(@Body() body: any, @Request() req: { user?: { id: string } }) {
    return this.sessionsService.create({
      doctorId: body.doctorId,
      patientId: body.patientId || req.user?.id,
      startTime: body.startTime,
      sessionType: body.sessionType ?? body.type,
      status: body.status,
      price: body.price != null ? Number(body.price) : undefined,
      patientName: body.patientName,
      videoUrl: body.videoUrl,
      audioUrl: body.audioUrl,
      notes: body.notes,
    });
  }

  @Put(':id')
  async updateSession(@Param('id') id: string, @Body() body: any) {
    return this.sessionsService.updateSession(id, {
      doctorId: body.doctorId,
      patientId: body.patientId,
      startTime: body.startTime,
      sessionType: body.sessionType ?? body.type,
      status: body.status,
      price: body.price != null ? Number(body.price) : undefined,
      patientName: body.patientName,
      videoUrl: body.videoUrl,
      audioUrl: body.audioUrl,
    });
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status?: string }) {
    const status = body?.status ?? (body as unknown as string);
    return this.sessionsService.updateStatus(id, status);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sessionsService.delete(id);
  }
}
