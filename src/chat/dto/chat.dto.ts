import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum ChatRomTypes {
  GROUP = 'Group',
  DEFAULT = 'Default',
}

export class CreateChatRoomDto {
  @IsEnum(ChatRomTypes)
  type: ChatRomTypes;

  @IsString()
  name: string;

  @IsBoolean()
  isRead: boolean;

  users: number[];
}

export class GetSpecificChatRoomDto {
  @IsOptional()
  chatRoomId?: number;

  @IsEnum(ChatRomTypes)
  type: ChatRomTypes;

  @IsOptional()
  name?: string;

  users: number[];
}

export class UpdateChatRoomDto {
  @IsNumber()
  chatRoomId: number;

  @IsOptional()
  name?: string;

  @IsOptional()
  users: number[];
}

export class AddMessageDto {
  @IsString()
  content: string;

  @IsNumber()
  chatRoomId: number;

  @IsNumber()
  userId: number;
}

export class UpdateMessageDto {
  @IsNumber()
  messageId: number;

  @IsString()
  content: string;
}

export class DeleteMessageDto {
  @IsNumber()
  messageId: number;
}

export class SeenMessageDto {
  @IsNumber()
  chatRoomId: number;
}
