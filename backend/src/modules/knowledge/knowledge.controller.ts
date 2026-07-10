import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.knowledgeService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.knowledgeService.delete(id);
  }
}
