import { z } from 'zod';

export const uuidSchema = z.string().uuid('ID tidak valid');

export const validateUuid = (id: string) => {
  return uuidSchema.parse(id);
};
