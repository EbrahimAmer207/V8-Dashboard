import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  @Roles('ADMIN', 'MODERATOR', 'SUPPORT')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.ticketsService.findAll(
      parseInt(page || '1'),
      parseInt(limit || '20'),
      search,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'MODERATOR', 'SUPPORT')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async create(@Body() data: any, @Request() req: any) {
    return this.ticketsService.create({
      userId: data.userId || req.user.id,
      subject: data.subject,
      message: data.message,
    });
  }

  @Put(':id')
  @Roles('ADMIN', 'MODERATOR', 'SUPPORT')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.ticketsService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }
}
