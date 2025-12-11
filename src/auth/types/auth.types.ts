export interface Permission {
  idPermission: number;
  namaPermission: string;
  deskripsi: string | null;
  createdAt: Date;
}

export interface RolePermission {
  idRole: number;
  idPermission: number;
  permission: Permission;
}

export interface Role {
  idRole: number;
  namaRole: string;
  level: number;
  deskripsi: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: RolePermission[];
}

/**
 * ===== DEPARTMENT & JABATAN TYPES =====
 */
export interface Departemen {
  idDepartemen: string;
  namaDepartemen: string;
  idRoleDefault: number;
  roleDefault?: Role;
}

export interface Jabatan {
  idJabatan: string;
  namaJabatan: string;
  idDepartemen: string;
  departemen?: Departemen;
}

export interface Karyawan {
  idKaryawan: string;
  nama: string;
  nik: string | null;
  email: string | null;
  idJabatan: string;
  jabatan?: Jabatan;
}

export interface UserRole {
  idUser: string;
  idRole: number;
  role: Role;
}

export interface User {
  idUser: string;
  username: string;
  email: string;
  passwordHash: string;
  useDepartmentRole: boolean;
  isActive: boolean;
  loginAttempts: number;
  lockedUntil: Date | null;
  lastLogin: Date | null;
  idKaryawan: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithRelations extends User {
  karyawan?: Karyawan | null;
  userRoles?: UserRole[];
}

export interface RoleInfo {
  idRole: number;
  namaRole: string;
  level: number;
}

export interface KaryawanInfo {
  idKaryawan: string;
  nama: string;
  nik: string | null;
  jabatan: {
    namaJabatan?: string;
    departemen?: string;
  };
}

export interface UserInfo {
  idUser: string;
  username: string;
  email: string;
  karyawan: KaryawanInfo | null;
  roles: RoleInfo[];
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  user: UserInfo;
}

export interface CreateUserResponse {
  idUser: string;
  username: string;
  email: string;
  useDepartmentRole: boolean;
  roles: RoleInfo[];
  permissions: string[];
}

export interface ToggleUserStatusResponse {
  idUser: string;
  username: string;
  isActive: boolean;
}

export interface UserListItem {
  idUser: string;
  username: string;
  email: string;
  isActive: boolean;
  useDepartmentRole: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  karyawan: KaryawanInfo | null;
  roles: RoleInfo[];
  permissions: string[];
}

export interface GetAllUsersResponse {
  data: UserListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
  };
}

export interface RolesAndPermissions {
  roles: Role[];
  permissions: string[];
}

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  idKaryawan?: string;
  roles: RoleInfo[];
  permissions: string[];
  iat?: number;
  exp?: number;
}
