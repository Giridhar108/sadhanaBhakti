import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { JapaHistoryQueryDto, UpdateJapaTodayDto } from './dto/japa-today.dto';
import { toJapaDailyProgressDto } from './types';

const getTodayDateKey = () => new Date().toISOString().slice(0, 10);

@Injectable()
export class JapaService {
  constructor(private readonly prisma: PrismaService) {}

  async getDailyProgress(userId: string, date = getTodayDateKey()) {
    const progress = await this.prisma.japaDailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    return toJapaDailyProgressDto(progress, date);
  }

  async getDailyProgressHistory(userId: string, query: JapaHistoryQueryDto) {
    const dateFilter = {
      gte: query.from,
      lte: query.to,
    };
    const progressItems = await this.prisma.japaDailyProgress.findMany({
      where: {
        userId,
        date: query.from || query.to ? dateFilter : undefined,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return progressItems.map((progress) => toJapaDailyProgressDto(progress, progress.date));
  }

  async setDailyProgress(userId: string, input: UpdateJapaTodayDto) {
    const data = {
      rounds: input.rounds,
      goalRounds: input.goalRounds,
    };
    const progress = await this.prisma.japaDailyProgress.upsert({
      where: {
        userId_date: {
          userId,
          date: input.date,
        },
      },
      create: {
        userId,
        date: input.date,
        rounds: input.rounds ?? 0,
        goalRounds: input.goalRounds,
      },
      update: data,
    });

    return toJapaDailyProgressDto(progress, input.date);
  }
}
