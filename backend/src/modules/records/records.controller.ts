import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  async findAllRecords() {
    return this.recordsService.findAllRecords();
  }

  @Get('reports')
  async findAllReports() {
    return this.recordsService.findAllReports();
  }

  @Get('my-records')
  async findMyRecords(@Request() req: any) {
    return this.recordsService.findAllRecords(); // Placeholder or filter by user
  }

  @Post()
  async createRecord(@Body() data: any, @Request() req: any) {
    return this.recordsService.createRecord({ 
      ...data, 
      patientId: data.patientId || req.user.id 
    });
  }

  @Put(':id')
  async updateRecord(@Param('id') id: string, @Body() data: any) {
    return this.recordsService.updateRecord(id, data);
  }

  @Post(':id/delete')
  async deleteRecord(@Param('id') id: string) {
    return this.recordsService.deleteRecord(id);
  }

  @Post('reports/:id/delete')
  async deleteReport(@Param('id') id: string) {
    return this.recordsService.deleteReport(id);
  }
}
