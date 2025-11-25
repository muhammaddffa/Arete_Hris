import { Module } from '@nestjs/common';
import { WawancaraService } from './wawancara.service';
import { WawancaraController } from './wawancara.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WawancaraController],
  providers: [WawancaraService],
  exports: [WawancaraService],
})
export class WawancaraModule {}
