import { ApiProperty } from '@nestjs/swagger';
import { TimeMeasures } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: 'servico 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Descricao do servico 1',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 40,
  })
  @IsNumber()
  @IsNotEmpty()
  estimatedTime: number;

  @ApiProperty({
    example: 'MINUTE',
    required: false,
    enum: [TimeMeasures],
  })
  @IsString()
  @IsOptional()
  timeMeasure: string;

  @ApiProperty({
    example: 12345,
    description:
      'O "value" deve ser um inteiro em centavos. Ex: R$ 135 reais deve ser representado como "13500"',
  })
  @IsNumber()
  @IsNotEmpty()
  value: number;

  @ApiProperty({
    example: 14,
  })
  @IsNumber()
  @IsNotEmpty()
  commissionPercentage: number;
}
