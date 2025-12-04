import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../types/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    // Payload dari JWT token
    const user = await this.prisma.user.findUnique({
      where: { idUser: payload.sub },
      include: {
        karyawan: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User tidak aktif atau tidak ditemukan');
    }

    // Data ini sudah ada di JWT payload
    return {
      idUser: payload.sub,
      username: payload.username,
      email: payload.email,
      idKaryawan: payload.idKaryawan || null,
      roles: payload.roles,
      permissions: payload.permissions,
      useDepartmentRole: user.useDepartmentRole,
    };
  }
}
