import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/types';
import {
  japaHistoryQuerySchema,
  japaTodayQuerySchema,
  updateJapaTodaySchema,
  type JapaHistoryQueryDto,
  type JapaTodayQueryDto,
  type UpdateJapaTodayDto,
} from './dto/japa-today.dto';
import { JapaService } from './japa.service';

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@UseGuards(JwtAuthGuard)
@Controller('japa')
export class JapaController {
  constructor(private readonly japaService: JapaService) {}

  @Get('today')
  getToday(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe(japaTodayQuerySchema)) query: JapaTodayQueryDto,
  ) {
    return this.japaService.getDailyProgress(request.user.sub, query.date);
  }

  @Get('history')
  getHistory(
    @Req() request: AuthenticatedRequest,
    @Query(new ZodValidationPipe(japaHistoryQuerySchema)) query: JapaHistoryQueryDto,
  ) {
    return this.japaService.getDailyProgressHistory(request.user.sub, query);
  }

  @Patch('today')
  updateToday(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateJapaTodaySchema)) body: UpdateJapaTodayDto,
  ) {
    return this.japaService.setDailyProgress(request.user.sub, body);
  }
}
