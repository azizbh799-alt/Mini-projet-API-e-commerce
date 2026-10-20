import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Amira Ben Ali' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'amira@example.com' })
  @IsEmail()
  email: string;
}
