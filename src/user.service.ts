import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './user/dto/login-user.dto';
import { PrismaService } from './prisma.service';
import { RegisterUserDto } from './user/dto/register-user.dto';

const scrypt = promisify(scryptCallback);

type RegisterUserResponse = {
  id: string;
  email: string;
  alias: string | null;
  createdAt: Date;
};

type LoginUserResponse = {
  id: string;
  email: string;
  alias: string | null;
  createdAt: Date;
};

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterUserDto): Promise<RegisterUserResponse> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        alias: dto.alias?.trim() || null,
      },
      select: {
        id: true,
        email: true,
        alias: true,
        createdAt: true,
      },
    });

    return user;
  }

  async login(dto: LoginUserDto): Promise<LoginUserResponse> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        alias: true,
        createdAt: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await this.verifyPassword(
      dto.password,
      user.passwordHash,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      id: user.id,
      email: user.email,
      alias: user.alias,
      createdAt: user.createdAt,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(':');

    if (!salt || !key) {
      return false;
    }

    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
  }
}
