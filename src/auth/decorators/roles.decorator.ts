// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

// Decorator untuk set required role levels
export const Roles = (...levels: number[]) => SetMetadata(ROLES_KEY, levels);
