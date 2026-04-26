import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [UserModule],
  providers: [JwtService],
})
export class AppModule {}
