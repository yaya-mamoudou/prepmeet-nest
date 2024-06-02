import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { Gender, UserRole } from 'src/utils/enum';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 30)
  password;
}

export class RegisterDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 30)
  password: string;

  @IsNotEmpty()
  hasAcceptedTerms: boolean;

  @IsNotEmpty()
  role: UserRole;

  country: string;
  location: string;
  gender: Gender;
  profilePhoto: string;
  dateOfBirth: Date;
  phoneNumber: string;
}
