import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class ConfirmDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
