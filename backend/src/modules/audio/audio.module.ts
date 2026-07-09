import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { AudioController } from './audio.controller';
import { AudioService } from './audio.service';

@Module({
  imports: [PrismaModule],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
