import { Body, Controller, Get, Patch, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtUser } from '../auth/types';
import { updateMeSchema, type UpdateMeDto } from './dto/update-me.dto';
import { toAuthUserDto } from './types';
import { UsersService } from './users.service';

type AuthenticatedRequest = Request & {
  user: JwtUser;
};

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getCommunity(@Query('date') date?: string) {
    return this.usersService.findCommunity(date);
  }

  @Get('me')
  async getMe(@Req() request: AuthenticatedRequest) {
    const user = await this.usersService.findByIdOrThrow(request.user.sub);

    return toAuthUserDto(user);
  }

  @Patch('me')
  async updateMe(
    @Req() request: AuthenticatedRequest,
    @Body(new ZodValidationPipe(updateMeSchema)) body: UpdateMeDto,
  ) {
    const user = await this.usersService.updateMe(request.user.sub, body);

    return toAuthUserDto(user);
  }
}
