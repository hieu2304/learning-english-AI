import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Matches(/^[a-z0-9_]{6,}$/)
  username: string;

  @MinLength(6)
  password: string;
}
