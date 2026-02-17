import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { SaldoCutiController } from './saldo-cuti.controller';
import { SaldoCutiService } from './saldo-cuti.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SaldoCutiController],
  providers: [SaldoCutiService],
  exports: [SaldoCutiService],
})
export class SaldoCutiModule {}
