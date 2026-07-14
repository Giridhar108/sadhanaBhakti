import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, type User } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './types';

const accessCookieName = 'access_token';
const refreshCookieName = 'refresh_token';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

const scrypt = promisify(scryptCallback);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString('base64url')}`;
}

async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedHash] = passwordHash.split(':');

  if (algorithm !== 'scrypt' || !salt || !storedHash) {
    return false;
  }

  const storedBuffer = Buffer.from(storedHash, 'base64url');
  const derivedKey = (await scrypt(password, salt, storedBuffer.length)) as Buffer;

  return storedBuffer.length === derivedKey.length && timingSafeEqual(storedBuffer, derivedKey);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  getCookieNames() {
    return {
      accessCookieName,
      refreshCookieName,
    };
  }

  async registerWithEmail(input: RegisterDto) {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.prisma.user.create({
      data: {
        email,
        name: input.name.trim(),
        passwordHash: await hashPassword(input.password),
        provider: AuthProvider.EMAIL,
      },
    });
  }

  async loginWithEmail(input: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
    });

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await verifyPassword(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  }

  async createSession(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = randomBytes(48).toString('base64url');
    const refreshTokenTtlDays = 30;
    const expiresAt = new Date(Date.now() + refreshTokenTtlDays * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      accessMaxAgeMs: 15 * 60 * 1000,
      refreshMaxAgeMs: refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    };
  }

  async refreshSession(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    return this.createSession(storedToken.user);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  getFrontendUrl() {
    return this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  }
}
