import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SaldoCutiController } from './saldo-cuti.controller';
import { SaldoCutiService } from './saldo-cuti.service';

@Module({
  imports: [PrismaModule],
  controllers: [SaldoCutiController],
  providers: [SaldoCutiService],
})
export class SaldoCutiModule {}
