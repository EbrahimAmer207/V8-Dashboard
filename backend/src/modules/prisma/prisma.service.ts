import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      console.warn('[PrismaService] Could not connect to database on init.', err?.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
