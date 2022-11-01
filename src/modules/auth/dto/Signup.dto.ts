import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SignupDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  type: 'employee' | 'client';
}
