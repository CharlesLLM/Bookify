import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailService } from 'src/email/email.service';
import { randomBytes, createHash } from 'crypto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';

type AuthResponse = {
  access_token: string;
};

type TwoFactorAuthResponse = {
  requires2FA: boolean;
  message: string;
};

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async create(createDto: CreateUserDto) {
    const normalizedEmail = createDto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(createDto.password, 10),
        alias: createDto.alias.trim(),
        roles: createDto.roles?.map((r) => r.trim()) ?? ['user'],
        isVerified: true,
        twoFactorEnabled: false,
      },
    });

    return user;
  }

  async register(registerDto: RegisterUserDto) {
    const normalizedEmail = registerDto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(registerDto.password, 10),
        alias: registerDto.alias.trim(),
        isVerified: false,
        twoFactorEnabled: false,
      },
    });

    const rawToken = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');

    await this.prisma.verificationToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await this.emailService.sendVerificationEmail(user.email, rawToken);

    return { message: 'Check your inbox for a verification email.' };
  }

  async login(
    loginDto: LoginUserDto,
  ): Promise<AuthResponse | TwoFactorAuthResponse> {
    const normalizedEmail = loginDto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        alias: true,
        createdAt: true,
        passwordHash: true,
        isVerified: true,
        twoFactorEnabled: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    if (user.twoFactorEnabled) {
      const otpMinValue = 100000;
      const otpMaxValue = 900000;
      const otp = Math.floor(
        otpMinValue + Math.random() * otpMaxValue,
      ).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      const otpExpiryMilliseconds = 10 * 60 * 1000;
      const expiresAt = new Date(Date.now() + otpExpiryMilliseconds);

      await this.prisma.twoFactorCode.upsert({
        where: { userId: user.id },
        update: {
          codeHash: hashedOtp,
          expiresAt: expiresAt,
          attempts: 0,
        },
        create: {
          userId: user.id,
          codeHash: hashedOtp,
          expiresAt: expiresAt,
          attempts: 0,
        },
      });

      await this.emailService.sendTwoFactorCode(user.email, otp);

      return {
        requires2FA: true,
        message:
          'Two-factor authentication required. Check your email for the code.',
      };
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async verifyEmail(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const record = await this.prisma.verificationToken.findFirst({
      where: { tokenHash },
    });

    if (!record) {
      throw new BadRequestException('Invalid token');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });

    await this.prisma.verificationToken.delete({
      where: { id: record.id },
    });

    return { message: 'Email verified successfully' };
  }

  async verifyTwoFactorLogin(
    verifyTwoFactorDto: VerifyTwoFactorDto,
  ): Promise<AuthResponse> {
    const { userEmail, code } = verifyTwoFactorDto;

    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const twoFactorCodeRecord = await this.prisma.twoFactorCode.findUnique({
      where: { userId: user.id },
    });

    if (!twoFactorCodeRecord) {
      throw new UnauthorizedException('2FA code not found or expired.');
    }

    if (twoFactorCodeRecord.expiresAt < new Date()) {
      await this.prisma.twoFactorCode.delete({
        where: { userId: user.id },
      });
      throw new UnauthorizedException('2FA code expired.');
    }

    const maxOtpAttempts = 5;
    if (twoFactorCodeRecord.attempts >= maxOtpAttempts) {
      await this.prisma.twoFactorCode.delete({
        where: { userId: user.id },
      });
      throw new UnauthorizedException('Too many attempts.');
    }

    const isCodeValid = await bcrypt.compare(
      code,
      twoFactorCodeRecord.codeHash,
    );

    if (!isCodeValid) {
      await this.prisma.twoFactorCode.update({
        where: { userId: user.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid 2FA code.');
    }

    await this.prisma.twoFactorCode.delete({ where: { userId: user.id } });

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async enableTwoFactor(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
    return { message: 'Two-factor authentication enabled successfully.' };
  }

  async disableTwoFactor(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false },
    });
    await this.prisma.twoFactorCode.deleteMany({
      where: { userId },
    });
    return { message: 'Two-factor authentication disabled successfully.' };
  }
}
