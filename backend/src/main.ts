import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);
  const frontendUrl = config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
  const host = config.get<string>('HOST') ?? '0.0.0.0';
  const port = config.get<number>('PORT') ?? 4000;

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.use(cookieParser());
  app.enableShutdownHooks();

  await app.listen(port, host);
}

void bootstrap();
