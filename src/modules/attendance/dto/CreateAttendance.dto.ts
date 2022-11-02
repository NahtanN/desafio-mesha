import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateAttendanceDto {
  @IsNotEmpty()
  @IsArray()
  services: number[];
}
