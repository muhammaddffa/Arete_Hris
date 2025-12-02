/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required role levels from @Roles() decorator
    const requiredLevels = this.reflector.getAllAndOverride<number[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredLevels) {
      return true; // No role requirement
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.roles) {
      throw new ForbiddenException('Forbidden - User tidak memiliki role');
    }

    // Check if user has any role with matching level
    const hasRequiredRole = user.roles.some((role: any) =>
      requiredLevels.includes(role.level),
    );

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        'Forbidden - Anda tidak memiliki akses ke resource ini',
      );
    }

    return true;
  }
}
