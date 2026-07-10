import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto, UpdateDoctorDto } from './dto';

@Controller('doctors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @Roles('ADMIN', 'EDITOR', 'MODERATOR', 'SUPPORT')
  findAll() {
    return this.doctorsService.findAll();
  }

  @Get('search')
  @Roles('ADMIN', 'EDITOR', 'MODERATOR', 'SUPPORT')
  search(@Query('q') query: string) {
    return this.doctorsService.search(query);
  }

  @Get(':id')
  @Roles('ADMIN', 'EDITOR', 'MODERATOR', 'SUPPORT')
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'MODERATOR')
  create(@Body() data: CreateDoctorDto) {
    return this.doctorsService.create(data);
  }

  @Patch(':id')
  @Roles('ADMIN', 'MODERATOR')
  update(@Param('id') id: string, @Body() data: UpdateDoctorDto) {
    return this.doctorsService.update(id, data);
  }

  @Delete(':id')
  @Roles('ADMIN')
  delete(@Param('id') id: string) {
    return this.doctorsService.delete(id);
  }
}
