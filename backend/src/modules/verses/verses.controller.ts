import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/types';
import {
  createVerseSchema,
  updateVerseSchema,
  type CreateVerseDto,
  type UpdateVerseDto,
} from './dto/verse.dto';
import { VersesService } from './verses.service';

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@UseGuards(JwtAuthGuard)
@Controller('me/verses')
export class VersesController {
  constructor(private readonly versesService: VersesService) {}

  @Get()
  getAll(@Req() request: AuthenticatedRequest) {
    return this.versesService.getAll(request.user.sub);
  }

  @Get(':verseId')
  getById(@Req() request: AuthenticatedRequest, @Param('verseId') verseId: string) {
    return this.versesService.getById(request.user.sub, verseId);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(createVerseSchema)) body: CreateVerseDto,
  ) {
    return this.versesService.create(request.user.sub, body);
  }

  @Patch(':verseId')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('verseId') verseId: string,
    @Body(new ZodValidationPipe(updateVerseSchema)) body: UpdateVerseDto,
  ) {
    return this.versesService.update(request.user.sub, verseId, body);
  }

  @Delete(':verseId')
  remove(@Req() request: AuthenticatedRequest, @Param('verseId') verseId: string) {
    return this.versesService.remove(request.user.sub, verseId);
  }
}
