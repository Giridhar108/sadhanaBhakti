import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
        avatarUrl: input.avatarUrl,
        birthDate: input.birthDate,
        gender: input.gender,
        practices: input.practices,
        japaRounds: input.goals?.japaRounds,
        readingPages: input.goals?.readingPages,
        versesPerWeek: input.goals?.versesPerWeek,
        dailyReminder: input.settings?.dailyReminder,
        japaStartDate: input.settings?.japaStartDate,
        theme: input.settings?.theme,
        calendarEvents: input.settings?.calendarEvents as Prisma.InputJsonValue | undefined,
        dailyVerses: input.settings?.dailyVerses as Prisma.InputJsonValue | undefined,
        japaGoalHistory: input.settings?.japaGoalHistory as Prisma.InputJsonValue | undefined,
        isOnboarded: input.isOnboarded,
      },
    });
  }
}
