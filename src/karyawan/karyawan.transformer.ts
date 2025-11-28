/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { ConfigService } from '@nestjs/config';

export class KaryawanTransformer {
  constructor(private configService?: ConfigService) {}

  /**
   * Transform single karyawan for detail view (full data)
   */
  transformDetail(karyawan: any) {
    const baseUrl =
      this.configService?.get('APP_URL') || 'http://localhost:3000';

    return {
      idKaryawan: karyawan.idKaryawan,
      nik: karyawan.nik,
      npwp: karyawan.npwp,
      nama: karyawan.nama,
      tempatLahir: karyawan.tempatLahir,
      tanggalLahir: karyawan.tanggalLahir,
      jenisKelamin: karyawan.jenisKelamin,
      statusPernikahan: karyawan.statusPernikahan,
      agama: karyawan.agama,
      noHpPribadi: karyawan.noHpPribadi,
      email: karyawan.email,
      alamat: karyawan.alamat,
      namaBank: karyawan.namaBank,
      nomorRekening: karyawan.nomorRekening,
      statusKeaktifan: karyawan.statusKeaktifan,
      tanggalMasuk: karyawan.tanggalMasuk,
      tanggalResign: karyawan.tanggalResign,
      status: karyawan.status,
      createdAt: karyawan.createdAt,
      updatedAt: karyawan.updatedAt,

      // Files - return full URL or null
      documents: {
        pasfoto: karyawan.pasfoto ? `${baseUrl}/${karyawan.pasfoto}` : null,
        skck: karyawan.skck ? `${baseUrl}/${karyawan.skck}` : null,
        suratKesehatan: karyawan.suratKesehatan
          ? `${baseUrl}/${karyawan.suratKesehatan}`
          : null,
        cv: karyawan.cv ? `${baseUrl}/${karyawan.cv}` : null,
      },

      // Relations
      jabatan: karyawan.jabatan
        ? {
            idJabatan: karyawan.jabatan.idJabatan,
            namaJabatan: karyawan.jabatan.namaJabatan,
            departemen: karyawan.jabatan.departemen
              ? {
                  idDepartemen: karyawan.jabatan.departemen.idDepartemen,
                  namaDepartemen: karyawan.jabatan.departemen.namaDepartemen,
                }
              : null,
          }
        : null,

      // User info if exists
      user: karyawan.user
        ? {
            idUser: karyawan.user.idUser,
            username: karyawan.user.username,
            email: karyawan.user.email,
            isActive: karyawan.user.isActive,
          }
        : null,
    };
  }

  /**
   * Transform karyawan for list view (masked sensitive data)
   */
  transformList(karyawan: any) {
    const baseUrl =
      this.configService?.get('APP_URL') || 'http://localhost:3000';

    return {
      idKaryawan: karyawan.idKaryawan,
      nik: this.maskNIK(karyawan.nik),
      nama: karyawan.nama,
      jenisKelamin: karyawan.jenisKelamin,
      email: karyawan.email,
      noHpPribadi: this.maskPhone(karyawan.noHpPribadi),
      statusKeaktifan: karyawan.statusKeaktifan,
      status: karyawan.status,
      tanggalMasuk: karyawan.tanggalMasuk,

      // Thumbnail only
      pasfoto: karyawan.pasfoto ? `${baseUrl}/${karyawan.pasfoto}` : null,

      // Relations
      jabatan: karyawan.jabatan
        ? {
            idJabatan: karyawan.jabatan.idJabatan,
            namaJabatan: karyawan.jabatan.namaJabatan,
            departemen: karyawan.jabatan.departemen
              ? {
                  idDepartemen: karyawan.jabatan.departemen.idDepartemen,
                  namaDepartemen: karyawan.jabatan.departemen.namaDepartemen,
                }
              : null,
          }
        : null,
    };
  }

  transformCreateUpdate(karyawan: any) {
    return this.transformDetail(karyawan);
  }

  getFilePaths(karyawan: any): {
    pasfoto: string | null;
    skck: string | null;
    suratKesehatan: string | null;
    cv: string | null;
  } {
    return {
      pasfoto: karyawan.pasfoto || null,
      skck: karyawan.skck || null,
      suratKesehatan: karyawan.suratKesehatan || null,
      cv: karyawan.cv || null,
    };
  }

  private maskNIK(nik?: string): string | null {
    if (!nik) return null;
    if (nik.length !== 16) return nik;

    return `${nik.substring(0, 6)}******${nik.substring(12)}`;
  }

  private maskPhone(phone?: string): string | null {
    if (!phone) return null;
    if (phone.length < 8) return phone;

    const firstPart = phone.substring(0, 4);
    const lastPart = phone.substring(phone.length - 3);
    const maskLength = phone.length - 7;

    return `${firstPart}${'*'.repeat(maskLength)}${lastPart}`;
  }
}
