export interface Blacklist {
  idBlacklist: string;
  idKaryawan: string;
  nik: string;
  nama: string;
  pasfoto?: string | null;
  alasan: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlacklistWithKaryawan extends Blacklist {
  karyawan: {
    idKaryawan: string;
    nama: string;
    email?: string | null;
    noHpPribadi: string;
    status: string;
    jabatan: {
      namaJabatan: string;
      departemen: {
        namaDepartemen: string;
      };
    };
  };
}

export enum StatusWawancara {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum JenisWawancara {
  HRD = 'hrd',
  USER = 'user',
}

export interface Wawancara {
  idWawancara: string;
  idPewawancara: string;
  idPeserta: string;
  jenisWawancara: JenisWawancara;
  tanggalWawancara: Date;
  jamWawancara: string;
  lokasi?: string | null;
  linkOnline?: string | null;
  catatan?: string | null;
  hasil?: string | null;
  nilaiHasil?: number | null;
  status: StatusWawancara;
  createdAt: Date;
  updatedAt: Date;
}

export interface WawancaraWithRelations extends Wawancara {
  pewawancara: {
    idKaryawan: string;
    nama: string;
    email?: string | null;
    pasfoto?: string | null;
    jabatan: {
      namaJabatan: string;
      departemen: {
        namaDepartemen: string;
      };
    };
  };
  peserta: {
    idKaryawan: string;
    nama: string;
    email?: string | null;
    pasfoto?: string | null;
    status: string;
  };
}

export interface WawancaraFilterParams {
  status?: StatusWawancara;
  jenisWawancara?: JenisWawancara;
  idPewawancara?: string;
  idPeserta?: string;
  tanggalMulai?: Date;
  tanggalAkhir?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'tanggalWawancara' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedWawancara {
  data: WawancaraWithRelations[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
