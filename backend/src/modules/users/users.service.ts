import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { UpdateMeDto } from './dto/update-me.dto';
import { calculateJapaProgressForecast } from './japa-progress-forecast';
import type { FriendSummaryDto } from './types';

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;

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

  async findCommunity(date = new Date().toISOString().slice(0, 10)): Promise<FriendSummaryDto[]> {
    const parsedDate = new Date(`${date}T12:00:00.000Z`);

    if (
      !dateKeyPattern.test(date)
      || Number.isNaN(parsedDate.getTime())
      || parsedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new BadRequestException('Date must use YYYY-MM-DD format');
    }

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        spiritualName: true,
        avatarUrl: true,
        gender: true,
        japaRounds: true,
        japaStartDate: true,
        japaGoalHistory: true,
        japaDailyProgress: {
          where: { date: { lte: date } },
          select: {
            date: true,
            rounds: true,
          },
        },
      },
      orderBy: [{ spiritualName: 'asc' }, { name: 'asc' }],
    });

    return users.map((user) => {
      const forecast = calculateJapaProgressForecast({
        startDate: user.japaStartDate,
        todayDate: date,
        dailyRounds: user.japaRounds,
        goalHistory: user.japaGoalHistory,
        dailyProgress: user.japaDailyProgress,
      });

      return {
        id: user.id,
        name: user.name,
        spiritualName: user.spiritualName,
        avatarUrl: user.avatarUrl ?? undefined,
        gender: user.gender === 'male' || user.gender === 'female' ? user.gender : null,
        todayRounds: user.japaDailyProgress.find((progress) => progress.date === date)?.rounds ?? 0,
        dailyGoalRounds: forecast.dailyRounds,
        totalRounds: forecast.totalRounds,
        goalDate: forecast.targetDate,
      };
    });
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
