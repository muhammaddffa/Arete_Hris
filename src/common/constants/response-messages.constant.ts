export const RESPONSE_MESSAGES = {
  CREATED: 'Role berhasil dibuat',
  UPDATED: 'Role berhasil diupdate',
  DELETED: 'Role berhasil dihapus',
  FOUND: 'Role ditemukan',
  LIST: 'Daftar role berhasil diambil',
  NOT_FOUND: 'Role tidak ditemukan',

  DEPARTMENT: {
    CREATED: 'Departemen berhasil dibuat',
    UPDATED: 'Departemen berhasil diupdate',
    DELETED: 'Departemen berhasil dihapus',
    FOUND: 'Departemen ditemukan',
    LIST: 'Daftar departemen berhasil diambil',
    NOT_FOUND: 'Departemen tidak ditemukan',
    ALREADY_EXISTS: 'Departemen dengan nama tersebut sudah ada',
    HAS_JABATAN: 'Departemen tidak dapat dihapus karena masih memiliki jabatan',
  },

  JABATAN: {
    CREATED: 'Jabatan berhasil dibuat',
    UPDATED: 'Jabatan berhasil diupdate',
    DELETED: 'Jabatan berhasil dihapus',
    FOUND: 'Jabatan ditemukan',
    LIST: 'Daftar jabatan berhasil diambil',
    NOT_FOUND: 'Jabatan tidak ditemukan',
    ALREADY_EXISTS: 'Jabatan dengan nama tersebut sudah ada di departemen ini',
    HAS_KARYAWAN: 'Jabatan tidak dapat dihapus karena masih memiliki karyawan',
  },

  EMPLOYEE: {
    CREATED: 'Karyawan berhasil dibuat',
    UPDATED: 'Karyawan berhasil diupdate',
    DELETED: 'Karyawan berhasil dihapus',
    FOUND: 'Karyawan ditemukan',
    LIST: 'Daftar karyawan berhasil diambil',
    NOT_FOUND: 'Karyawan tidak ditemukan',
  },

  AUTH: {
    LOGIN_SUCCESS: 'Login berhasil',
    LOGOUT_SUCCESS: 'Logout berhasil',
    REGISTER_SUCCESS: 'Registrasi berhasil',
    INVALID_CREDENTIALS: 'Username atau password salah',
    ACCOUNT_LOCKED: 'Akun Anda terkunci. Silakan coba lagi nanti',
    TOKEN_EXPIRED: 'Token telah expired',
    UNAUTHORIZED: 'Anda tidak memiliki akses',
  },

  GENERAL: {
    SUCCESS: 'Operasi berhasil',
    FAILED: 'Operasi gagal',
    VALIDATION_ERROR: 'Validasi gagal',
    INTERNAL_ERROR: 'Terjadi kesalahan pada server',
    NOT_FOUND: 'Data tidak ditemukan',
    BAD_REQUEST: 'Request tidak valid',
  },

  KARYAWAN: {
    CREATED: 'Karyawan berhasil dibuat',
    UPDATED: 'Karyawan berhasil diupdate',
    DELETED: 'Karyawan berhasil dihapus',
    FOUND: 'Data karyawan ditemukan',
    LIST: 'Daftar karyawan berhasil diambil',
    NOT_FOUND: 'Karyawan tidak ditemukan',
    NIK_EXISTS: 'NIK sudah terdaftar',
    EMAIL_EXISTS: 'Email sudah terdaftar',
    UNDER_AGE: 'Karyawan harus berusia minimal 17 tahun',
    IS_ATASAN: 'Tidak dapat menghapus karyawan yang menjadi atasan',
    APPROVED: 'Candidate berhasil di-approve',
    REJECTED: 'Candidate berhasil di-reject',
    RESIGN: 'Karyawan berhasil resign',
    INVALID_STATUS: 'Status karyawan tidak valid untuk operasi ini',
  },

  ROLE: {
    NOT_FOUND: 'Role tidak ditemukan',
  },

  BLACKLIST: {
    CREATED: 'Karyawan berhasil ditambahkan ke blacklist',
    UPDATED: 'Data blacklist berhasil diupdate',
    DELETED: 'Berhasil dihapus dari blacklist',
    NOT_FOUND: 'Data blacklist tidak ditemukan',
    ALREADY_EXISTS: 'Karyawan sudah ada di blacklist',
    LIST: 'Daftar blacklist berhasil diambil',
    FOUND: 'Detail blacklist berhasil diambil',
    IS_BLACKLISTED: 'Karyawan ada di blacklist',
    NOT_BLACKLISTED: 'Karyawan tidak di blacklist',
  },

  // Wawancara
  WAWANCARA: {
    CREATED: 'Wawancara berhasil dijadwalkan',
    UPDATED: 'Data wawancara berhasil diupdate',
    DELETED: 'Data wawancara berhasil dihapus',
    NOT_FOUND: 'Data wawancara tidak ditemukan',
    SCHEDULE_CONFLICT: 'Jadwal bentrok dengan wawancara lain',
    LIST: 'Daftar wawancara berhasil diambil',
    FOUND: 'Detail wawancara berhasil diambil',
    COMPLETED: 'Wawancara berhasil diselesaikan',
    CANCELLED: 'Wawancara berhasil dibatalkan',
    RESCHEDULED: 'Wawancara berhasil dijadwalkan ulang',
    PEWAWANCARA_NOT_ACTIVE: 'Pewawancara harus karyawan aktif',
    PESERTA_NOT_CANDIDATE: 'Peserta harus berstatus candidate',
    CANNOT_CANCEL_COMPLETED:
      'Wawancara yang sudah selesai tidak bisa dibatalkan',
    ALREADY_CANCELLED: 'Wawancara sudah dibatalkan',
    ALREADY_COMPLETED: 'Wawancara sudah diselesaikan',
  },

  // Upload
  UPLOAD: {
    SUCCESS: 'File berhasil diupload',
    FAILED: 'Upload file gagal',
    DELETED: 'File berhasil dihapus',
    FILE_TOO_LARGE: 'Ukuran file terlalu besar',
    INVALID_FORMAT: 'Format file tidak valid',
  },
};
