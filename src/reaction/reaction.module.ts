import { Module } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';

@Module({
  controllers: [ReactionController],
  providers: [ReactionService, PrismaService, NotificationService],
})
export class ReactionModule {}
