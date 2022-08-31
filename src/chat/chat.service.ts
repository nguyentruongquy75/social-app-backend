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
        AND: [
          {
            users: {
              some: {
                userId,
              },
            },
          },
          {
            lastMessageId: {
              not: null,
            },
          },
        ],
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
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const addedInfo = chatRooms.items.map((chatRoom) => {
      const { name, image, active, lastActive } = this.getChatRoomInfo(
        chatRoom,
        userId,
      );

      return {
        ...chatRoom,
        name,
        image,
        active,
        lastActive,
      };
    });

    const unreadCount = await this.prismaService.chatRoom.count({
      where: {
        AND: [
          {
            users: {
              some: {
                userId,
              },
            },
          },
          {
            isRead: false,
          },
          {
            lastMessage: {
              userId: {
                not: userId,
              },
            },
          },
        ],
      },
    });

    return {
      ...chatRooms,
      items: addedInfo,
      unreadCount,
    };
  }

  async readChatRooms(userId: number) {
    await this.prismaService.chatRoom.updateMany({
      where: {
        AND: [
          {
            users: {
              some: {
                userId,
              },
            },
          },
          {
            isRead: false,
          },
          {
            lastMessage: {
              userId: {
                not: userId,
              },
            },
          },
        ],
      },
      data: {
        isRead: true,
      },
    });
  }

  async getChatRoomById(id: number) {
    return await this.prismaService.chatRoom.findUnique({
      where: {
        id,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  getChatRoomInfo(chatRoom: any, userId: number) {
    const chatRoomName =
      chatRoom.type === ChatRomTypes.DEFAULT
        ? chatRoom.users.find((user) => user.userId !== userId).user.fullName
        : chatRoom.name;

    const chatRoomImage =
      chatRoom.type === ChatRomTypes.DEFAULT
        ? chatRoom.users.find((user) => user.userId !== userId).user.avatarImage
        : chatRoom.image;

    const isActive =
      chatRoom.type === ChatRomTypes.DEFAULT
        ? chatRoom.users.find((user) => user.userId !== userId).user.active
        : true;

    const lastActive =
      chatRoom.type === ChatRomTypes.DEFAULT
        ? chatRoom.users.find((user) => user.userId !== userId).user.lastActive
        : null;
    return {
      name: chatRoomName,
      image: chatRoomImage,
      active: isActive,
      lastActive,
    };
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

  async getChatRoomMessages(
    userId: number,
    chatRoomId: number,
    page = 1,
    size = 10,
  ) {
    const chatRoom = await this.prismaService.chatRoom.findUnique({
      where: {
        id: chatRoomId,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
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
      orderBy: {
        createdAt: 'desc',
      },
      modelName: 'message',
      page,
      size,
    });

    const { name, active, lastActive } = this.getChatRoomInfo(chatRoom, userId);

    return {
      ...messages,
      room: {
        name,
        active,
        lastActive,
        type: chatRoom.type,
        id: chatRoom.id,
      },
      items: messages.items.slice().reverse(),
    };
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
        seen: {
          connect: {
            id: userId,
          },
        },
      },
    });

    await this.prismaService.chatRoom.update({
      where: {
        id: chatRoomId,
      },
      data: {
        lastMessageId: message.id,
        updatedAt: new Date(),
        isRead: false,
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

  async seenMessage(userId: number, chatRoomId: number) {
    const messages = await this.prismaService.message.findMany({
      where: {
        AND: [
          { chatRoomId },
          {
            seen: {
              none: {
                id: userId,
              },
            },
          },
        ],
      },
      include: {
        seen: true,
      },
    });

    await Promise.all(
      messages.map((message) =>
        this.prismaService.message.update({
          where: {
            id: message.id,
          },
          data: {
            seen: {
              connect: {
                id: userId,
              },
            },
          },
        }),
      ),
    );

    return 'Seen Successfully';
  }
}
