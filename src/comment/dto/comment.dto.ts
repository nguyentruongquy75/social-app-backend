import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  message: string;

  @IsNumber()
  userId: number;

  @IsOptional()
  tags?: number[];

  @IsOptional()
  replyId?: number;

  @IsNumber()
  postId: number;
}

export class UpdateCommentDto {
  @IsString()
  message: string;

  @IsOptional()
  tags?: number[];
}
