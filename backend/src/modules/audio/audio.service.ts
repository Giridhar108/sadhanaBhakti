import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'node:fs';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Response } from 'express';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import type { UploadedAudioFile } from './types';

const maxTitleLength = 80;
const maxSubtitleLength = 120;

type CreateAudioTrackInput = {
  title?: string;
  subtitle?: string;
};

@Injectable()
export class AudioService {
  private readonly uploadDirectory: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.uploadDirectory = resolve(
      this.config.get<string>('AUDIO_UPLOAD_DIR') ?? join(process.cwd(), 'uploads', 'audio'),
    );
  }

  list(userId: string) {
    return this.prisma.audioTrack.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, input: CreateAudioTrackInput, file?: UploadedAudioFile) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    if (!file.mimetype.startsWith('audio/')) {
      throw new BadRequestException('Only audio files are supported');
    }

    const title = this.normalizeText(input.title, maxTitleLength) || this.getTitleFromFile(file.originalname);
    const subtitle = this.normalizeText(input.subtitle, maxSubtitleLength);
    const extension = extname(file.originalname).toLowerCase() || '.mp3';
    const fileName = `${randomUUID()}${extension}`;

    await mkdir(this.uploadDirectory, { recursive: true });
    await writeFile(join(this.uploadDirectory, fileName), file.buffer);

    return this.prisma.audioTrack.create({
      data: {
        userId,
        title,
        subtitle,
        fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  async delete(userId: string, trackId: string) {
    const track = await this.findForUser(userId, trackId);

    await this.prisma.audioTrack.delete({
      where: { id: track.id },
    });

    await unlink(join(this.uploadDirectory, track.fileName)).catch(() => undefined);

    return { ok: true };
  }

  async stream(userId: string, trackId: string, rangeHeader: string | undefined, response: Response) {
    const track = await this.findForUser(userId, trackId);
    const filePath = join(this.uploadDirectory, track.fileName);
    const fileStats = await stat(filePath).catch(() => {
      throw new NotFoundException('Audio file not found');
    });

    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Content-Type', track.mimeType);

    if (!rangeHeader) {
      response.setHeader('Content-Length', fileStats.size);
      createReadStream(filePath).pipe(response);
      return;
    }

    const range = this.parseRange(rangeHeader, fileStats.size);

    if (!range) {
      response.status(416).setHeader('Content-Range', `bytes */${fileStats.size}`).end();
      return;
    }

    response.status(206);
    response.setHeader('Content-Length', range.end - range.start + 1);
    response.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${fileStats.size}`);
    createReadStream(filePath, { start: range.start, end: range.end }).pipe(response);
  }

  private async findForUser(userId: string, trackId: string) {
    const track = await this.prisma.audioTrack.findFirst({
      where: {
        id: trackId,
        userId,
      },
    });

    if (!track) {
      throw new NotFoundException('Audio track not found');
    }

    return track;
  }

  private normalizeText(value: string | undefined, maxLength: number) {
    return (value ?? '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
  }

  private getTitleFromFile(fileName: string) {
    return fileName.replace(/\.[^/.]+$/, '').trim().slice(0, maxTitleLength) || 'Аудио для практики';
  }

  private parseRange(rangeHeader: string, fileSize: number) {
    const [unit, rangeValue] = rangeHeader.split('=');

    if (unit !== 'bytes' || !rangeValue) {
      return null;
    }

    const [startValue, endValue] = rangeValue.split('-');
    const start = Number(startValue);
    const end = endValue ? Number(endValue) : fileSize - 1;

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || end >= fileSize) {
      return null;
    }

    return { start, end };
  }
}
