import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';

export class CreateAttendance {
  @IsNotEmpty()
  @IsArray()
  services: number[];
}
