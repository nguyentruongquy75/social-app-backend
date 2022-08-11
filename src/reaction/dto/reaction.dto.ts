import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

enum ReactionTypes {
  LIKE = 'Like',
  HAHA = 'Haha',
  LOVE = 'Love',
  SAD = 'Sad',
  WOW = 'Wow',
  ANGRY = 'Angry',
  CARE = 'Care',
}

export class CreateReactionDto {
  @IsEnum(ReactionTypes)
  type: ReactionTypes;

  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  postId?: number;

  @IsOptional()
  @IsNumber()
  commentId?: number;
}

export class UpdateReactionDto {
  @IsNumber()
  reactionId: number;

  @IsEnum(ReactionTypes)
  type: ReactionTypes;
}

export class DeleteReactionDto {
  @IsNumber()
  reactionId: number;
}
