import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SigninDTO {
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
