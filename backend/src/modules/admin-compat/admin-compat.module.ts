import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import {
  CasesCompatController,
  ContentCompatController,
  LogsCompatController,
  NotificationsCompatController,
  PermissionsCompatController,
  RequestsCompatController,
  RolesCompatController,
} from './admin-compat.controller';
import { AdminCompatService } from './admin-compat.service';

@Module({
  imports: [PrismaModule, KnowledgeModule],
  controllers: [
    RequestsCompatController,
    CasesCompatController,
    NotificationsCompatController,
    RolesCompatController,
    PermissionsCompatController,
    LogsCompatController,
    ContentCompatController,
  ],
  providers: [AdminCompatService],
})
export class AdminCompatModule {}
