import { IsEmail, IsInt, IsNumber, IsOptional } from 'class-validator';

export class DeleteFriendDto {
  @IsNumber()
  friendId: number;
}

export class UpdateUserDto {
  @IsOptional()
  fullName?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  avatarImage?: string;

  @IsOptional()
  coverImage?: string;
}

export class UpdateUserFileDto {
  @IsOptional()
  avatarImage?: Express.Multer.File[];

  @IsOptional()
  coverImage?: Express.Multer.File[];
}
