import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateAttendanceDto {
  @ApiProperty({
    example: [1, 2],
  })
  @IsNotEmpty()
  @IsArray()
  services: number[];
}
