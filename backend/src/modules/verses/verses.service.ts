import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { CreateVerseDto, UpdateVerseDto } from './dto/verse.dto';

type VerseWithProgress = Prisma.VerseGetPayload<{
  include: {
    progress: true;
  };
}>;

const defaultProgress = {
  status: 'new',
  sanskritProgress: 0,
  translationProgress: 0,
  repetitionLevel: 0,
  nextReviewAt: null,
  lastReviewedAt: null,
  isFavorite: false,
} as const;

const normalizeMultilineText = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

const normalizeVerseContent = (input: Partial<CreateVerseDto>) => ({
  bookTitle: input.bookTitle?.trim(),
  chapter: input.chapter === undefined ? undefined : input.chapter?.trim() || null,
  verseNumber: input.verseNumber?.trim(),
  sanskritCyrillic: input.sanskritCyrillic === undefined
    ? undefined
    : normalizeMultilineText(input.sanskritCyrillic),
  translation: input.translation === undefined
    ? undefined
    : normalizeMultilineText(input.translation),
});

const getProgressPatch = (input: UpdateVerseDto) => ({
  status: input.status,
  sanskritProgress: input.sanskritProgress,
  translationProgress: input.translationProgress,
  repetitionLevel: input.repetitionLevel,
  nextReviewAt: input.nextReviewAt,
  lastReviewedAt: input.lastReviewedAt,
  isFavorite: input.isFavorite,
});

const hasDefinedValue = (input: Record<string, unknown>) =>
  Object.values(input).some((value) => value !== undefined);

const serializeVerse = (verse: VerseWithProgress, userId: string) => {
  const personalProgress = verse.progress[0];

  return {
    id: verse.id,
    createdById: verse.createdById,
    isOwner: verse.createdById === userId,
    bookTitle: verse.bookTitle,
    chapter: verse.chapter,
    verseNumber: verse.verseNumber,
    sanskritCyrillic: verse.sanskritCyrillic,
    translation: verse.translation,
    catalog: verse.catalog,
    catalogOrder: verse.catalogOrder,
    status: personalProgress?.status ?? defaultProgress.status,
    sanskritProgress: personalProgress?.sanskritProgress ?? defaultProgress.sanskritProgress,
    translationProgress: personalProgress?.translationProgress ?? defaultProgress.translationProgress,
    repetitionLevel: personalProgress?.repetitionLevel ?? defaultProgress.repetitionLevel,
    nextReviewAt: personalProgress?.nextReviewAt ?? defaultProgress.nextReviewAt,
    lastReviewedAt: personalProgress?.lastReviewedAt ?? defaultProgress.lastReviewedAt,
    isFavorite: personalProgress?.isFavorite ?? defaultProgress.isFavorite,
    createdAt: verse.createdAt,
    updatedAt: verse.updatedAt,
  };
};

@Injectable()
export class VersesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(userId: string) {
    const verses = await this.prisma.verse.findMany({
      include: {
        progress: {
          where: { userId },
          take: 1,
        },
      },
      orderBy: [
        { catalog: { sort: 'asc', nulls: 'first' } },
        { catalogOrder: { sort: 'asc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
    });

    return verses.map((verse) => serializeVerse(verse, userId));
  }

  async getById(userId: string, verseId: string) {
    const verse = await this.prisma.verse.findUnique({
      where: { id: verseId },
      include: {
        progress: {
          where: { userId },
          take: 1,
        },
      },
    });

    if (!verse) {
      throw new NotFoundException('Стих не найден');
    }

    return serializeVerse(verse, userId);
  }

  async create(userId: string, input: CreateVerseDto) {
    const content = normalizeVerseContent(input);
    const verse = await this.prisma.$transaction(async (transaction) => {
      const createdVerse = await transaction.verse.create({
        data: {
          createdById: userId,
          bookTitle: content.bookTitle!,
          chapter: content.chapter,
          verseNumber: content.verseNumber!,
          sanskritCyrillic: content.sanskritCyrillic!,
          translation: content.translation!,
        },
      });

      await transaction.userVerseProgress.create({
        data: {
          userId,
          verseId: createdVerse.id,
        },
      });

      return createdVerse;
    });

    return this.getById(userId, verse.id);
  }

  async update(userId: string, verseId: string, input: UpdateVerseDto) {
    const verse = await this.prisma.verse.findUnique({
      where: { id: verseId },
      select: {
        id: true,
        createdById: true,
      },
    });

    if (!verse) {
      throw new NotFoundException('Стих не найден');
    }

    const contentPatch = normalizeVerseContent(input);
    const progressPatch = getProgressPatch(input);
    const hasContentChanges = hasDefinedValue(contentPatch);
    const hasProgressChanges = hasDefinedValue(progressPatch);

    if (hasContentChanges && verse.createdById !== userId) {
      throw new ForbiddenException('Редактировать стих может только его автор');
    }

    await this.prisma.$transaction(async (transaction) => {
      if (hasContentChanges) {
        await transaction.verse.update({
          where: { id: verseId },
          data: contentPatch,
        });
      }

      if (hasProgressChanges) {
        await transaction.userVerseProgress.upsert({
          where: {
            userId_verseId: {
              userId,
              verseId,
            },
          },
          create: {
            userId,
            verseId,
            ...progressPatch,
          },
          update: progressPatch,
        });
      }
    });

    return this.getById(userId, verseId);
  }

  async remove(userId: string, verseId: string) {
    const verse = await this.prisma.verse.findUnique({
      where: { id: verseId },
      select: {
        createdById: true,
      },
    });

    if (!verse) {
      throw new NotFoundException('Стих не найден');
    }

    if (verse.createdById !== userId) {
      throw new ForbiddenException('Удалить стих может только его автор');
    }

    await this.prisma.verse.delete({
      where: { id: verseId },
    });

    return { ok: true };
  }
}
