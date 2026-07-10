import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, PaginationDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN', 'EDITOR', 'MODERATOR', 'SUPPORT')
  async findAll(@Query() paginationDto: any) {
    return this.usersService.findAll(paginationDto);
  }

  @Get('stats')
  @Roles('ADMIN')
  async getStats() {
    return this.usersService.getStats();
  }

  @Get('search')
  @Roles('ADMIN', 'EDITOR', 'MODERATOR', 'SUPPORT')
  async search(@Query('q') q: string, @Query('limit') limit: number) {
    return this.usersService.findAll({ search: q, limit: limit || 10 });
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @Roles('ADMIN', 'MODERATOR', 'SUPPORT')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/activity')
  @Roles('ADMIN', 'MODERATOR', 'SUPPORT')
  async getActivityLog(@Param('id') id: string, @Query('limit') limit: number) {
    return this.usersService.getActivityLog(id, limit);
  }

  @Post()
  @Roles('ADMIN', 'MODERATOR')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    // Users can only update their own profile unless they're admin
    if (!['ADMIN', 'MODERATOR'].includes(user.role) && user.id !== id) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return this.usersService.update(id, updateUserDto);
  }

  // @Put(':id/role')
  // @Roles('ADMIN')
  // async updateRole(@Param('id') id: string, @Body('role') role: string) {
  //   return this.usersService.updateRole(id, role);
  // }

  @Delete(':id')
  @Roles('ADMIN')
  async delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
