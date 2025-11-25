import { ApiProperty } from '@nestjs/swagger';

export class CloudinaryUploadResponseDto {
  @ApiProperty({ example: 'pasfoto' })
  fieldname: string;

  @ApiProperty({ example: 'photo.jpg' })
  originalname: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../photo.jpg' })
  url: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/.../photo.jpg' })
  secureUrl: string;

  @ApiProperty({ example: 'hr-system/photos/abc123' })
  publicId: string;

  @ApiProperty({ example: 'jpg' })
  format: string;

  @ApiProperty({ example: 123456 })
  bytes: number;

  @ApiProperty({ example: 800 })
  width?: number;

  @ApiProperty({ example: 800 })
  height?: number;

  @ApiProperty({ example: 'image' })
  resourceType: string;
}
