import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Decorator untuk menandai route sebagai public (tidak perlu authentication)
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
