import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { VersesController } from './verses.controller';
import { VersesService } from './verses.service';

@Module({
  imports: [PrismaModule],
  controllers: [VersesController],
  providers: [VersesService],
})
export class VersesModule {}
