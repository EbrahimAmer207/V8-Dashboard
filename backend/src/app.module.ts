import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { RecordsModule } from './modules/records/records.module';
import { SocialModule } from './modules/social/social.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { PodcastsModule } from './modules/podcasts/podcasts.module';
import { AdminCompatModule } from './modules/admin-compat/admin-compat.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    SessionsModule,
    RecordsModule,
    SocialModule,
    ResourcesModule,
    TicketsModule,
    DoctorsModule,
    KnowledgeModule,
    PodcastsModule,
    AdminCompatModule,
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
