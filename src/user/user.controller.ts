import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';
import { AuthGuard } from './auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.userService.login(dto);
  }

  @Post('2fa/verify')
  async verifyTwoFactor(@Body() dto: VerifyTwoFactorDto) {
    return this.userService.verifyTwoFactorLogin(dto);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('2fa/enable')
  async enableTwoFactor(@Request() req) {
    return this.userService.enableTwoFactor(req.user.sub);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @Post('2fa/disable')
  async disableTwoFactor(@Request() req) {
    return this.userService.disableTwoFactor(req.user.sub);
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.userService.verifyEmail(token);
  }
}
