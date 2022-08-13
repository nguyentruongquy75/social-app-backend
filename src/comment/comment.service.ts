import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  COMMENT_NOTIFICATION_MESSAGE,
  INVALID_ID_PROVIDED,
  REPLY_NOTIFICATION_MESSAGE,
} from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { NotificationTypes } from 'src/notification/dto/notification.dto';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
@crud('comment')
export class CommentService extends CrudService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {
    super(prismaService);
  }

  async createComment(createCommentDto: CreateCommentDto) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: createCommentDto.postId,
      },
      include: {
        comments: true,
      },
    });

    if (!post)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const createCommentBuilder: any = { ...createCommentDto };

    if (createCommentDto.tags)
      createCommentBuilder.tags = {
        connect: createCommentDto.tags.map((id) => ({ id })),
      };

    const newComment = await this.prismaService.comment.create({
      data: createCommentBuilder,
      include: {
        user: true,
        replyOf: {
          include: {
            replies: true,
          },
        },
      },
    });

    this.prismaService.post.update({
      where: {
        id: createCommentDto.postId,
      },
      data: {
        comments: {
          connect: {
            id: newComment.id,
          },
        },
      },
    });

    // notification
    const uniqueCommentUsers = new Set(
      post.comments.map((comment) => comment.userId),
    );

    uniqueCommentUsers.delete(post.userId);

    const notificationTitle =
      this.notificationService.generateNotificationMessage({
        authorId: newComment.userId,
        message: COMMENT_NOTIFICATION_MESSAGE,
        set: uniqueCommentUsers,
        username: newComment.user.fullName,
      });

    post.userId !== newComment.userId &&
      this.notificationService.createOrUpdateNotification({
        title: notificationTitle,
        link: '',
        type: NotificationTypes.COMMENT,
        postId: createCommentDto.postId,
        userId: post.userId,
      });

    if (createCommentDto.replyId) {
      this.updateOne(createCommentDto.replyId, {
        replies: {
          connect: {
            id: newComment.id,
          },
        },
      });

      newComment.replyOf.userId !== newComment.userId &&
        this.notificationService.createNotification({
          title: REPLY_NOTIFICATION_MESSAGE.replace(
            '{{user}}',
            newComment.user.fullName,
          ),
          link: '',
          type: NotificationTypes.COMMENT,
          postId: createCommentDto.postId,
          userId: newComment.replyOf.userId,
          commentId: newComment.replyId,
        });
    }

    return newComment;
  }

  async getCommentReplies(commentId: number) {
    const comment = await this.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const replies = await this.findAll({
      where: {
        replyId: commentId,
      },
      include: {
        user: true,
        reactions: true,
      },
    });

    return replies;
  }

  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto) {
    const comment = await this.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const updateCommentBuilder: any = { ...updateCommentDto };
    updateCommentBuilder.updatedAt = new Date();

    if (updateCommentDto.tags)
      updateCommentBuilder.tags = {
        connect: updateCommentDto.tags.map((id) => ({ id })),
      };
    const updatedComment = await this.updateOne(
      commentId,
      updateCommentBuilder,
    );

    return updatedComment;
  }

  async deleteComment(commentId: number) {
    const comment = await this.findOne({
      where: {
        id: commentId,
      },
    });

    if (!comment)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    await this.deleteOne(commentId, true);

    return comment;
  }
}
