import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { resourceStorage } from './resource-upload.config';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return this.resourcesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('File', { storage: resourceStorage() }))
  async create(
    @Body() data: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.resourcesService.create(data, file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('File', { storage: resourceStorage() }))
  async update(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.resourcesService.update(id, data, file);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string) {
    return this.resourcesService.delete(id);
  }

  @Post(':id/delete')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: string) {
    return this.resourcesService.delete(id);
  }
}
