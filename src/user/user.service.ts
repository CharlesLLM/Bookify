import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

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

  async register(createUserDto: CreateUserDto): Promise<RegisterUserResponse> {
    const normalizedEmail = createUserDto.email.toLowerCase().trim();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(createUserDto.password, 10),
        alias: createUserDto.alias?.trim() || null,
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

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);

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
}
