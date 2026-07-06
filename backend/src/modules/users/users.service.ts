import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByIdOrThrow(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  updateMe(userId: string, input: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        spiritualName: input.spiritualName,
        practices: input.practices,
        japaRounds: input.goals?.japaRounds,
        readingPages: input.goals?.readingPages,
        versesPerWeek: input.goals?.versesPerWeek,
        isOnboarded: input.isOnboarded,
      },
    });
  }
}
