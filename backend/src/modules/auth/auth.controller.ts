import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { toAuthUserDto } from '../users/types';
import { AuthService } from './auth.service';
import { loginSchema, type LoginDto } from './dto/login.dto';
import { registerSchema, type RegisterDto } from './dto/register.dto';

function setAuthCookies(response: Response, session: Awaited<ReturnType<AuthService['createSession']>>) {
  const secure = process.env.NODE_ENV === 'production';

  response.cookie('access_token', session.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: session.accessMaxAgeMs,
  });
  response.cookie('refresh_token', session.refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    maxAge: session.refreshMaxAgeMs,
    path: '/api/auth',
  });
}

function clearAuthCookies(response: Response) {
  response.clearCookie('access_token');
  response.clearCookie('refresh_token', { path: '/api/auth' });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.registerWithEmail(body);
    const session = await this.authService.createSession(user);

    setAuthCookies(response, session);

    return toAuthUserDto(user);
  }

  @Post('login')
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.loginWithEmail(body);
    const session = await this.authService.createSession(user);

    setAuthCookies(response, session);

    return toAuthUserDto(user);
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const session = await this.authService.refreshSession(request.cookies?.refresh_token as string | undefined);

    setAuthCookies(response, session);

    return { ok: true };
  }

  @Post('logout')
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.authService.logout(request.cookies?.refresh_token as string | undefined);
    clearAuthCookies(response);

    return { ok: true };
  }
}
