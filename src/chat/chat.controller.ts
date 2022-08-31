import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { ChatService } from './chat.service';
import {
  AddMessageDto,
  CreateChatRoomDto,
  DeleteMessageDto,
  GetSpecificChatRoomDto,
  SeenMessageDto,
  UpdateChatRoomDto,
  UpdateMessageDto,
} from './dto/chat.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get()
  async getChatRoomOfUser(@GetUser() user) {
    return this.chatService.getChatRooms(user.id);
  }

  @Put('read')
  async readChatRooms(@GetUser() user) {
    return this.chatService.readChatRooms(user.id);
  }

  @Get(':id')
  async getChatRoomById(@Param('id') id: number) {
    return await this.chatService.getChatRoomById(id);
  }

  @Post()
  async getSpecificChatRoom(
    @Body() getSpecificChatRoomDto: GetSpecificChatRoomDto,
  ) {
    return this.chatService.getSpecificChatRoom(getSpecificChatRoomDto);
  }

  // @Post('create')
  // async createChatRoom(@Body() createChatRoomDto: CreateChatRoomDto) {
  //   return this.chatService.createChatRoom(createChatRoomDto);
  // }

  @Get(':id/messages')
  async getChatRoomMessages(
    @Param('id') chatRoomId: number,
    @GetUser() user,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.chatService.getChatRoomMessages(
      user.id,
      chatRoomId,
      page || 1,
      size || 10,
    );
  }

  @Put('update')
  async updateChatRoom(@Body() updateChatRoomDto: UpdateChatRoomDto) {
    return await this.chatService.updateChatRoom(updateChatRoomDto);
  }

  @Post('message')
  async addMessage(@Body() addMessageDto: AddMessageDto) {
    return await this.chatService.addMessage(addMessageDto);
  }

  @Put('message')
  async updateMessage(@Body() updateMessageDto: UpdateMessageDto) {
    return await this.chatService.updateMessage(updateMessageDto);
  }

  @Delete('message')
  async deleteMessage(@Body() deleteMessageDto: DeleteMessageDto) {
    return await this.chatService.deleteMessage(deleteMessageDto);
  }

  @Post('seen')
  async seenMessages(@GetUser() user, @Body() seenMessageDto: SeenMessageDto) {
    return this.chatService.seenMessage(user.id, seenMessageDto.chatRoomId);
  }
}
