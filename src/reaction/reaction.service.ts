import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INVALID_ID_PROVIDED } from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateReactionDto,
  DeleteReactionDto,
  UpdateReactionDto,
} from './dto/reaction.dto';

@Injectable()
@crud('reaction')
export class ReactionService extends CrudService {
  constructor(private prismaService: PrismaService) {
    super(prismaService);
  }

  async createReaction(createReactionDto: CreateReactionDto) {
    if (createReactionDto.postId) {
      const post = await this.prismaService.post.findUnique({
        where: {
          id: createReactionDto.postId,
        },
      });

      if (!post)
        throw new HttpException('Invalid Post ID', HttpStatus.BAD_REQUEST);
    }

    if (createReactionDto.commentId) {
      const comment = await this.prismaService.comment.findUnique({
        where: {
          id: createReactionDto.commentId,
        },
      });

      if (!comment)
        throw new HttpException('Invalid Comment ID', HttpStatus.BAD_REQUEST);
    }

    const reaction = await this.createOne(createReactionDto);

    if (createReactionDto.postId)
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

    if (createReactionDto.commentId)
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
