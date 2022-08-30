import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateNotificationDto,
  ReadNotificationDto,
  UpdateNotificationDto,
} from './dto/notification.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  @Post('create')
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return await this.notificationService.createNotification(
      createNotificationDto,
    );
  }

  @Post('update')
  async updateNotification(
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    return await this.notificationService.updateNotification(
      updateNotificationDto,
    );
  }

  @Post('createorupdate')
  async createOrUpdateNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return await this.notificationService.createOrUpdateNotification(
      createNotificationDto,
    );
  }

  @Post('read')
  async readNotifications(@Body() readNotificationDto: ReadNotificationDto) {
    return await this.notificationService.readNotifications(
      readNotificationDto.userId,
    );
  }
}
