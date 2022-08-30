import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INVALID_ID_PROVIDED } from 'src/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateNotificationDto,
  GenerateNotificationMessageDto,
  NotificationTypes,
  UpdateNotificationDto,
} from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prismaService: PrismaService) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prismaService.notification.create({
      data: createNotificationDto,
    });

    return notification;
  }

  async updateNotification(updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.prismaService.notification.findUnique({
      where: {
        id: updateNotificationDto.notificationId,
      },
    });
    if (!notification)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const updatedNotification = await this.prismaService.notification.update({
      where: {
        id: notification.id,
      },
      data: updateNotificationDto,
    });

    return updatedNotification;
  }

  async createOrUpdateNotification(
    createNotificationDto: CreateNotificationDto,
  ) {
    const { type, userId, title, postId, commentId, reactionId } =
      createNotificationDto;

    const queryBuilder = { type, userId, postId, commentId, reactionId };
    if (!commentId) queryBuilder.commentId = null;
    if (!reactionId) queryBuilder.reactionId = null;

    const notification = await this.prismaService.notification.findFirst({
      where: queryBuilder,
    });

    // create
    if (!notification) {
      const newNotification = await this.prismaService.notification.create({
        data: createNotificationDto,
      });

      return newNotification;
    }

    // update
    const updatedNotification = await this.prismaService.notification.update({
      where: {
        id: notification.id,
      },
      data: {
        title,
        updatedAt: new Date(),
        isRead: false,
        ...queryBuilder,
      },
    });

    return updatedNotification;
  }

  generateNotificationMessage(
    generateNotificationMessageDto: GenerateNotificationMessageDto,
  ) {
    const { authorId, message, set, username } = generateNotificationMessageDto;

    const count = set.has(authorId) ? set.size - 1 : set.size;

    const users =
      count > 0 ? `${username} và ${count} người khác` : `${username}`;

    return message.replace('{{user}}', users);
  }

  async readNotifications(userId: number) {
    return await this.prismaService.notification.updateMany({
      where: {
        userId,
      },
      data: {
        isRead: true,
      },
    });
  }
}
