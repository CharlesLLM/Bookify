import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString =
      process.env.DATABASE_URL ??
      'postgresql://admin:xxx@localhost:5432/bookify?schema=public';
    const adapter = new PrismaPg({ connectionString });

    super({
      adapter,
    });
  }
}
