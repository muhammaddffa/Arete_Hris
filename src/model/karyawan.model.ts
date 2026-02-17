// src/model/karyawan.model.ts

export enum StatusKaryawan {
  AKTIF = 'aktif',
  REJECTED = 'rejected',
  CANDIDATE = 'candidate',
  RESIGN = 'resign',
}

export enum JenisKelamin {
  L = 'L',
  P = 'P',
}

export enum StatusPernikahan {
  BELUM_MENIKAH = 'belum_menikah',
  MENIKAH = 'menikah',
  CERAI = 'cerai',
}

export interface Karyawan {
  idKaryawan: string;
  nik?: string | null;
  npwp?: string | null;
  skck?: string | null;
  suratKesehatan?: string | null;
  cv?: string | null;
  nama: string;
  tempatLahir: string;
  tanggalLahir: Date;
  jenisKelamin: JenisKelamin;
  statusPernikahan: StatusPernikahan;
  pasfoto?: string | null;
  agama: string;
  noHpPribadi: string;
  email?: string | null;
  alamat?: string | null;
  idJabatan: string;
  namaBank?: string | null;
  nomorRekening?: string | null;
  statusKeaktifan: boolean;
  tanggalMasuk: Date;
  tanggalResign?: Date | null;
  status: StatusKaryawan;

  // Auth fields (langsung di refKaryawan, tidak ada tabel users)
  username?: string | null;
  isActive: boolean;
  lastLogin?: Date | null;
  mustChangePassword: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface KaryawanWithRelations extends Karyawan {
  jabatan: {
    idJabatan: string;
    namaJabatan: string;
    departemen: {
      idDepartemen: string;
      namaDepartemen: string;
      // roleDefault dihapus — tidak ada lagi refrole
    };
    atasan?: {
      idKaryawan: string;
      nama: string;
      pasfoto?: string | null;
    } | null;
    // Permission dari jabatan (bitmask)
    permissions?: {
      levelAkses: number;
      permission: {
        idPermission: number;
        namaPermission: string;
      };
    }[];
  };
}

export interface KaryawanFilterParams {
  status?: StatusKaryawan;
  statusKeaktifan?: boolean;
  idDepartemen?: string;
  idJabatan?: string;
  jenisKelamin?: JenisKelamin;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'nama' | 'tanggalMasuk' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedKaryawan {
  data: KaryawanWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
