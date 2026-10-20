import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Informatique' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
