import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { AudioModule } from './modules/audio/audio.module';
import { HealthModule } from './modules/health/health.module';
import { JapaModule } from './modules/japa/japa.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    AudioModule,
    JapaModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
