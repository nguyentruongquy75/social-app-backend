import { IsEmail, IsInt, IsNumber, IsOptional } from 'class-validator';

interface Image {
  public_id: string;
  url: string;
}

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
  avatarImage?: Image;

  @IsOptional()
  coverImage?: Image;

  @IsOptional()
  active?: Boolean;

  @IsOptional()
  lastActive?: Date;
}

export class UpdateUserFileDto {
  @IsOptional()
  avatarImage?: Express.Multer.File[];

  @IsOptional()
  coverImage?: Express.Multer.File[];
}
