import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { EVENTS } from './constants';
import { PrismaService } from './prisma/prisma.service';
import { UsersService } from './users/users.service';

@WebSocketGateway({ cors: true })
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;

  constructor(
    private userService: UsersService,
    private prismaService: PrismaService,
  ) {}

  handleDisconnect(client: any) {
    client.user_id &&
      this.userService.updateUser(+client.user_id, {
        active: false,
        lastActive: new Date(),
      });
  }
  handleConnection(client: any) {}

  @SubscribeMessage(EVENTS.ONLINE)
  handleUserOnline(socket, data) {
    socket.user_id = data;
    this.userService.updateUser(+data, {
      active: true,
    });
  }

  @SubscribeMessage(EVENTS.VOICE_CHAT)
  async handleVoiceChat(@MessageBody() data) {
    const room = await this.prismaService.chatRoom.findUnique({
      where: {
        id: data.roomId,
      },
      include: {
        users: true,
      },
    });

    const participants = room.users.filter(
      (user) => user.userId !== data.userId,
    );

    participants.forEach((user) =>
      this.server.emit(user.userId + EVENTS.VOICE_CHAT, {
        event: user.userId + EVENTS.VOICE_CHAT,
        data: {
          userId: data.userId,
          roomId: room.id,
        },
      }),
    );
  }

  @SubscribeMessage(EVENTS.VIDEO_CALL)
  async handleVideoCall(@MessageBody() data) {
    const room = await this.prismaService.chatRoom.findUnique({
      where: {
        id: data.roomId,
      },
      include: {
        users: true,
      },
    });

    const participants = room.users.filter(
      (user) => user.userId !== data.userId,
    );

    participants.forEach((user) =>
      this.server.emit(user.userId + EVENTS.VIDEO_CALL, {
        event: user.userId + EVENTS.VIDEO_CALL,
        data: {
          userId: data.userId,
          roomId: room.id,
        },
      }),
    );
  }

  @SubscribeMessage(EVENTS.UPDATE_ROOM_CALL_RTC)
  updateRoomCall(@MessageBody() data) {
    this.server.emit(data.roomId + data.type, data);
  }
}
