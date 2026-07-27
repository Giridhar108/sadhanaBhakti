import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { CreateVerseDto, UpdateVerseDto } from './dto/verse.dto';

const normalizeMultilineText = (value: string) =>
  value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();

const normalizeVerseInput = <TValue extends CreateVerseDto | UpdateVerseDto>(input: TValue) => ({
  ...input,
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

@Injectable()
export class VersesService {
  constructor(private readonly prisma: PrismaService) {}

  getAll(userId: string) {
    return this.prisma.userVerse.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(userId: string, verseId: string) {
    const verse = await this.prisma.userVerse.findFirst({
      where: { id: verseId, userId },
    });

    if (!verse) {
      throw new NotFoundException('Стих не найден');
    }

    return verse;
  }

  create(userId: string, input: CreateVerseDto) {
    return this.prisma.userVerse.create({
      data: {
        ...normalizeVerseInput(input),
        userId,
      },
    });
  }

  async update(userId: string, verseId: string, input: UpdateVerseDto) {
    await this.getById(userId, verseId);

    return this.prisma.userVerse.update({
      where: { id: verseId },
      data: normalizeVerseInput(input),
    });
  }

  async remove(userId: string, verseId: string) {
    const result = await this.prisma.userVerse.deleteMany({
      where: { id: verseId, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Стих не найден');
    }

    return { ok: true };
  }
}
