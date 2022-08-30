import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { CrudModule } from './crud/crud.module';
import { CrudService } from './crud/crud.service';
import { InvitationModule } from './invitation/invitation.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PostModule } from './post/post.module';
import { ReactionModule } from './reaction/reaction.module';
import { CommentModule } from './comment/comment.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { EventGateway } from './event.gateway';
import { UsersService } from './users/users.service';

@Module({
  imports: [
    AuthModule,
    CrudModule,
    UsersModule,
    InvitationModule,
    CloudinaryModule,
    PostModule,
    ReactionModule,
    CommentModule,
    ChatModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    CrudService,
    EventGateway,
    UsersService,
  ],
})
export class AppModule {}
