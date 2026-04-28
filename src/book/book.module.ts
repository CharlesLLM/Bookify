import { Module } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [BookController],
  providers: [BookService, PrismaService],
  imports: [AuthModule],
  exports: [BookService],
})
export class BookModule {}
