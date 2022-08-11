import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INVALID_ID_PROVIDED } from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
@crud('comment')
export class CommentService extends CrudService {
  constructor(private prismaService: PrismaService) {
    super(prismaService);
  }

  async createComment(createCommentDto: CreateCommentDto) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: createCommentDto.postId,
      },
    });
    if (!post)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const createCommentBuilder: any = { ...createCommentDto };

    if (createCommentDto.tags)
      createCommentBuilder.tags = {
        connect: createCommentDto.tags.map((id) => ({ id })),
      };

    const newComment = await this.createOne(createCommentBuilder);

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

    if (createCommentDto.replyId)
      this.updateOne(createCommentDto.replyId, {
        replies: {
          connect: {
            id: newComment.id,
          },
        },
      });

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
