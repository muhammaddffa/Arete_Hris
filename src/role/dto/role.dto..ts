import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ example: 1 })
  idRole: number;

  @ApiProperty({ example: 'Superadmin' })
  namaRole: string;

  @ApiProperty({ example: 'Full system access' })
  deskripsi: string;

  @ApiProperty({
    example: 1,
    description: '1=Superadmin, 2=HRD/Admin, 3=Manager, 4=Staff',
  })
  level: number;
}
