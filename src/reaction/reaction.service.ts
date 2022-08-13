import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  INVALID_ID_PROVIDED,
  REACTION_COMMENT_NOTIFICATION_MESSAGE,
  REACTION_POST_NOTIFICATION_MESSAGE,
} from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { NotificationTypes } from 'src/notification/dto/notification.dto';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateReactionDto,
  DeleteReactionDto,
  UpdateReactionDto,
} from './dto/reaction.dto';

@Injectable()
@crud('reaction')
export class ReactionService extends CrudService {
  constructor(
    private prismaService: PrismaService,
    private notificationService: NotificationService,
  ) {
    super(prismaService);
  }

  async createReaction(createReactionDto: CreateReactionDto) {
    let notificationUserId, notificationTitle, post, comment;

    if (createReactionDto.postId) {
      const checkPost = await this.prismaService.post.findUnique({
        where: {
          id: createReactionDto.postId,
        },
        include: {
          reactions: true,
        },
      });

      if (!checkPost)
        throw new HttpException('Invalid Post ID', HttpStatus.BAD_REQUEST);

      notificationUserId = checkPost.userId;
      post = checkPost;
    }

    if (createReactionDto.commentId) {
      const checkComment = await this.prismaService.comment.findUnique({
        where: {
          id: createReactionDto.commentId,
        },
        include: {
          reactions: true,
        },
      });

      if (!checkComment)
        throw new HttpException('Invalid Comment ID', HttpStatus.BAD_REQUEST);

      notificationUserId = checkComment.userId;
      comment = checkComment;
    }

    const reaction = await this.prismaService.reaction.create({
      data: createReactionDto,
      include: {
        user: true,
      },
    });

    if (createReactionDto.postId) {
      const uniqueReactionUsers: Set<number> = new Set(
        post.reactions.map((reaction) => reaction.userId),
      );

      uniqueReactionUsers.delete(post.userId);

      notificationTitle = this.notificationService.generateNotificationMessage({
        authorId: reaction.userId,
        set: uniqueReactionUsers,
        username: reaction.user.fullName,
        message: REACTION_POST_NOTIFICATION_MESSAGE,
      });

      this.prismaService.post.update({
        where: {
          id: createReactionDto.postId,
        },
        data: {
          reactions: {
            connect: {
              id: reaction.id,
            },
          },
        },
      });

      post.userId !== reaction.userId &&
        this.notificationService.createOrUpdateNotification({
          link: '',
          postId: post.id,
          title: notificationTitle,
          type: NotificationTypes.REACTION,
          userId: post.userId,
        });
    }

    if (createReactionDto.commentId) {
      const uniqueReactionUsers: Set<number> = new Set(
        comment.reactions.map((reaction) => reaction.userId),
      );

      uniqueReactionUsers.delete(comment.userId);

      notificationTitle = this.notificationService.generateNotificationMessage({
        authorId: reaction.userId,
        set: uniqueReactionUsers,
        username: reaction.user.fullName,
        message: REACTION_COMMENT_NOTIFICATION_MESSAGE,
      });

      this.prismaService.comment.update({
        where: {
          id: createReactionDto.commentId,
        },
        data: {
          reactions: {
            connect: {
              id: reaction.id,
            },
          },
        },
      });

      comment.userId !== reaction.userId &&
        this.notificationService.createOrUpdateNotification({
          link: '',
          commentId: comment.id,
          title: notificationTitle,
          type: NotificationTypes.REACTION,
          userId: comment.userId,
          postId: comment.postId,
        });
    }

    return reaction;
  }

  async updateReaction(updateReactionDto: UpdateReactionDto) {
    const reaction = await this.findOne({
      where: {
        id: updateReactionDto.reactionId,
      },
    });
    if (!reaction)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    delete updateReactionDto.reactionId;

    const updatedReaction = await this.updateOne(reaction.id, {
      ...updateReactionDto,
      updatedAt: new Date(),
    });

    return updatedReaction;
  }

  async deleteReaction(deleteReactionDto: DeleteReactionDto) {
    const reaction = await this.findOne({
      where: {
        id: deleteReactionDto.reactionId,
      },
    });
    if (!reaction)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    this.deleteOne(reaction.id, true);
    return reaction;
  }
}
