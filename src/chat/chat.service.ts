import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  INVALID_CHATROOM_ID,
  INVALID_MESSAGE_ID,
  INVALID_USER_ID,
  YOU_ARE_NOT_PARTICIPANT,
} from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddMessageDto,
  ChatRomTypes,
  CreateChatRoomDto,
  DeleteMessageDto,
  GetSpecificChatRoomDto,
  UpdateChatRoomDto,
  UpdateMessageDto,
} from './dto/chat.dto';

@Injectable()
@crud('chatRoom')
export class ChatService extends CrudService {
  constructor(private prismaService: PrismaService) {
    super(prismaService);
  }

  async getChatRooms(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw new HttpException(INVALID_USER_ID, HttpStatus.BAD_REQUEST);

    const chatRooms = await this.findAll({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
        lastMessage: {
          include: {
            user: true,
            seen: true,
          },
        },
      },
    });

    return chatRooms;
  }

  async searchChatRooms(search: string) {
    const users = await this.findAll({
      where: {
        fullName: {
          contains: search,
        },
      },
      modelName: 'user',
    });

    return users;
  }

  async getSpecificChatRoom(getSpecificChatRoomDto: GetSpecificChatRoomDto) {
    const { type, users, name = '', chatRoomId } = getSpecificChatRoomDto;

    const queryInclude = {
      users: {
        include: {
          user: true,
        },
      },
      messages: true,
    };

    // Get By ID
    if (chatRoomId) {
      const chatRoom = await this.findOne({
        where: {
          id: chatRoomId,
        },
        include: queryInclude,
      });

      if (!chatRoom)
        throw new HttpException(INVALID_CHATROOM_ID, HttpStatus.BAD_REQUEST);

      return chatRoom;
    }

    const queryBuilder: any = {
      type,
    };

    if (type === ChatRomTypes.GROUP) queryBuilder.name = name;

    const chatRoom = await this.prismaService.chatRoom.findFirst({
      where: {
        ...queryBuilder,
        users: {
          every: {
            userId: {
              in: users,
            },
          },
        },
      },
      include: queryInclude,
    });

    if (!chatRoom) {
      const createBuilder: CreateChatRoomDto = {
        type,
        users,
        name,
        isRead: false,
      };

      const newChatRoom = await this.createChatRoom(createBuilder);
      return newChatRoom;
    }

    return chatRoom;
  }

  async createChatRoom(createChatRoomDto: CreateChatRoomDto) {
    const createChatRoomBuilder: any = {
      ...createChatRoomDto,
    };

    const connectUsers = createChatRoomDto.users.map((id) => ({
      user: {
        connect: {
          id,
        },
      },
    }));

    createChatRoomBuilder.users = {
      create: connectUsers,
    };

    const chatRoom = await this.prismaService.chatRoom.create({
      data: createChatRoomBuilder,
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    return chatRoom;
  }

  async updateChatRoom(updateChatRoomDto: UpdateChatRoomDto) {
    const { chatRoomId, users, name } = updateChatRoomDto;

    const chatRoom = await this.findOne({
      where: {
        id: chatRoomId,
      },
    });

    if (!chatRoom)
      throw new HttpException(INVALID_CHATROOM_ID, HttpStatus.BAD_REQUEST);

    const updateBuilder: any = { ...updateChatRoomDto };

    delete updateBuilder.chatRoomId;
    if (!name) delete updateBuilder.name;
    if (users) {
      const connectUsers = users.map((id) => ({
        user: {
          connect: {
            id,
          },
        },
      }));

      updateBuilder.users = {
        connectOrCreate: connectUsers,
      };
    }

    const updatedChatRoom = await this.updateOne(chatRoomId, updateBuilder);

    return updatedChatRoom;
  }

  async getChatRoomMessages(chatRoomId: number) {
    const chatRoom = await this.findOne({
      where: {
        id: chatRoomId,
      },
    });

    if (!chatRoom)
      throw new HttpException(INVALID_CHATROOM_ID, HttpStatus.BAD_REQUEST);

    const messages = await this.findAll({
      where: {
        chatRoomId,
      },
      include: {
        user: true,
        reaction: true,
        seen: true,
      },
      modelName: 'message',
    });

    return messages;
  }

  async addMessage(addMessageDto: AddMessageDto) {
    const { chatRoomId, content, userId } = addMessageDto;

    const chatRoom = await this.findOne({
      where: {
        id: chatRoomId,
      },
      include: {
        users: true,
      },
    });

    if (!chatRoom)
      throw new HttpException(INVALID_CHATROOM_ID, HttpStatus.BAD_REQUEST);

    const isParticipant = chatRoom.users.some((user) => user.userId === userId);
    if (!isParticipant)
      throw new HttpException(YOU_ARE_NOT_PARTICIPANT, HttpStatus.FORBIDDEN);

    const message = await this.prismaService.message.create({
      data: {
        chatRoomId,
        content,
        userId,
        seenUserId: userId,
      },
    });

    await this.prismaService.chatRoom.update({
      where: {
        id: chatRoomId,
      },
      data: {
        lastMessageId: message.id,
      },
    });

    return message;
  }

  async updateMessage(updateMessageDto: UpdateMessageDto) {
    const { content, messageId } = updateMessageDto;
    const message = await this.prismaService.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message)
      throw new HttpException(INVALID_MESSAGE_ID, HttpStatus.BAD_REQUEST);

    const updatedMessage = await this.prismaService.message.update({
      where: {
        id: messageId,
      },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return updatedMessage;
  }

  async deleteMessage(deleteMessageDto: DeleteMessageDto) {
    const message = await this.prismaService.message.findUnique({
      where: {
        id: deleteMessageDto.messageId,
      },
    });
    if (!message)
      throw new HttpException(INVALID_MESSAGE_ID, HttpStatus.BAD_REQUEST);

    await this.prismaService.message.delete({
      where: {
        id: deleteMessageDto.messageId,
      },
    });

    return message;
  }
}
