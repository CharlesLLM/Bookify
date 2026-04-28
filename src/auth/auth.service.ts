import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkIsAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.roles.includes('admin')) {
      throw new ForbiddenException('Forbidden');
    }

    return user;
  }
}
