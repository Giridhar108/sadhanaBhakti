import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { JapaController } from './japa.controller';
import { JapaService } from './japa.service';

@Module({
  imports: [PrismaModule],
  controllers: [JapaController],
  providers: [JapaService],
})
export class JapaModule {}
