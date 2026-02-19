import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// ===============================================
// ASSIGN PERMISSION TO JABATAN
// ===============================================
export class AssignPermissionDto {
  @ApiProperty({
    description: 'ID Permission yang akan di-assign',
    example: 'uuid-permission',
  })
  @IsUUID()
  idPermission: string;

  @ApiProperty({
    description:
      'Level akses bitmask (1=READ, 2=CREATE, 4=UPDATE, 8=DELETE, 15=FULL)',
    example: 3,
    minimum: 1,
    maximum: 15,
  })
  @IsInt()
  @Min(1)
  @Max(15)
  levelAkses: number;
}

// ===============================================
// BULK ASSIGN PERMISSIONS
// ===============================================
export class BulkAssignPermissionsDto {
  @ApiProperty({
    description: 'Array of permissions to assign',
    type: [AssignPermissionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignPermissionDto)
  permissions: AssignPermissionDto[];
}

// ===============================================
// UPDATE PERMISSION LEVEL
// ===============================================
export class UpdatePermissionLevelDto {
  @ApiProperty({
    description: 'New level akses bitmask',
    example: 7,
    minimum: 1,
    maximum: 15,
  })
  @IsInt()
  @Min(1)
  @Max(15)
  levelAkses: number;
}

// ===============================================
// FILTER JABATAN PERMISSION
// ===============================================
export class FilterJabatanPermissionDto {
  @ApiProperty({
    description: 'Filter by jabatan ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  idJabatan?: string;

  @ApiProperty({
    description: 'Filter by permission ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  idPermission?: string;

  @ApiProperty({
    description: 'Filter by departemen ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  idDepartemen?: string;
}

// ===============================================
// PERMISSION MATRIX RESPONSE
// ===============================================
export class PermissionMatrixDto {
  @ApiProperty()
  idJabatan: string;

  @ApiProperty()
  namaJabatan: string;

  @ApiProperty()
  namaDepartemen: string;

  @ApiProperty({
    description: 'Map of permission name to bitmask level',
    example: {
      manage_karyawan: 1,
      own_presensi: 3,
      submit_izin: 3,
    },
  })
  permissions: Record<string, number>;
}
