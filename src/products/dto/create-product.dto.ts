import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Clavier mecanique' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 150, minimum: 0 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 12, minimum: 0 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  categoryId: number;
}
