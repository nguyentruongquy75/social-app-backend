import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsOptional()
  images: string[];

  userId: number;

  @IsOptional()
  tagsId: number[];
}

export class EditPostDto {
  @IsString()
  title: string;

  @IsOptional()
  images?: string[];

  @IsNumber()
  postId: number;
}

export class DeletePostDto {
  @IsNumber()
  postId: number;
}
