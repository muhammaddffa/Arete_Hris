export const PERMISSION = {
  READ: 1,
  CREATE: 2,
  UPDATE: 4,
  DELETE: 8,

  READ_ONLY: 1,
  READ_WRITE: 1 | 2 | 4, // = 7
  FULL: 1 | 2 | 4 | 8, // = 15
} as const;

export function hasPermission(levelAkses: number, action: number): boolean {
  return (levelAkses & action) > 0;
}

export function hasAllPermissions(
  levelAkses: number,
  ...actions: number[]
): boolean {
  const required = actions.reduce((acc, a) => acc | a, 0);
  return (levelAkses & required) === required;
}

export function describePermission(levelAkses: number): string[] {
  const result: string[] = [];
  if (levelAkses & PERMISSION.READ) result.push('read');
  if (levelAkses & PERMISSION.CREATE) result.push('create');
  if (levelAkses & PERMISSION.UPDATE) result.push('update');
  if (levelAkses & PERMISSION.DELETE) result.push('delete');
  return result;
}
