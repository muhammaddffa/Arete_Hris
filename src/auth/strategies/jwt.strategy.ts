/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    // PERBAIKAN: Ganti 'user' jadi 'refKaryawan'
    const karyawan = await this.prisma.refKaryawan.findUnique({
      where: { idKaryawan: payload.sub },
    });

    if (!karyawan || !karyawan.isActive) {
      throw new UnauthorizedException();
    }

    return {
      idKaryawan: payload.sub,
      username: payload.username,
      nik: payload.nik,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
