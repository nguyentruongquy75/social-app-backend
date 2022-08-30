import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum NotificationTypes {
  TAG = 'Tag',
  COMMENT = 'Comment',
  REACTION = 'Reaction',
}

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  link: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsEnum(NotificationTypes)
  type: NotificationTypes;

  @IsNumber()
  userId: number;

  @IsNumber()
  postId: number;

  @IsOptional()
  commentId?: number;

  @IsOptional()
  reactionId?: number;
}

export class UpdateNotificationDto {
  @IsNumber()
  notificationId: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}

export class GenerateNotificationMessageDto {
  message: string;

  set: Set<number>;

  authorId: number;

  username: string;
}

export class ReadNotificationDto {
  @IsNumber()
  userId: number;
}
