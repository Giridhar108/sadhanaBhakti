import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/types';
import { maxUserAudioFileSize } from './audio.constants';
import { AudioService } from './audio.service';
import { toAudioTrackDto, type UploadedAudioFile } from './types';

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

type CreateAudioTrackRequest = {
  title?: string;
  subtitle?: string;
};

@UseGuards(JwtAuthGuard)
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get()
  async list(@Req() request: AuthenticatedRequest) {
    const tracks = await this.audioService.list(request.user.sub);

    return tracks.map(toAudioTrackDto);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: maxUserAudioFileSize } }))
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateAudioTrackRequest,
    @UploadedFile() file: UploadedAudioFile | undefined,
  ) {
    const track = await this.audioService.create(request.user.sub, body, file);

    return toAudioTrackDto(track);
  }

  @Delete(':id')
  delete(@Req() request: AuthenticatedRequest, @Param('id') trackId: string) {
    return this.audioService.delete(request.user.sub, trackId);
  }

  @Get(':id/file')
  @Header('Cache-Control', 'private, max-age=3600')
  stream(
    @Req() request: AuthenticatedRequest,
    @Param('id') trackId: string,
    @Res() response: Response,
  ) {
    return this.audioService.stream(request.user.sub, trackId, request.headers.range, response);
  }
}
