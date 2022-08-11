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
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, CrudService],
})
export class AppModule {}
