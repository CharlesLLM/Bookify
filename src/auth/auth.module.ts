import { Module } from '@nestjs/common';

import { AuthGuard } from 'src/auth/auth-guard';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [AuthGuard, AuthService, PrismaService],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
