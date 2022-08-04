import { IsEmail, IsString, MinLength } from 'class-validator';
import { MIN_LENGTH_PASSWORD } from 'src/constants';
import { UserStatus } from '../interfaces';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(MIN_LENGTH_PASSWORD)
  password: string;
}

export class RegisterDto {
  @IsString()
  fullName: string;

  bio: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @MinLength(MIN_LENGTH_PASSWORD)
  password: string;

  avatarImage: string;

  coverImage: string;

  @IsString()
  status: UserStatus;
}
