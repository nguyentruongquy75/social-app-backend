import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INVALID_ID_PROVIDED } from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto, EditPostDto } from './dto';

@Injectable()
@crud('post')
export class PostService extends CrudService {
  constructor(private prismaService: PrismaService) {
    super(prismaService);
  }

  async getPostById(postId: number) {
    const post = await this.findOne({
      where: {
        id: postId,
      },
      include: {
        user: true,
        tags: true,
        reactions: true,
        comments: true,
      },
    });

    if (!post)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    return post;
  }

  async createPost(createPostDto: CreatePostDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: createPostDto.userId,
      },
      select: {
        friends: {
          select: {
            id: true,
          },
        },
        id: true,
      },
    });

    if (!user)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const post = await this.createOne(createPostDto);

    const userNewfeed = [
      ...user.friends,
      {
        id: user.id,
      },
    ];

    this.updateOne(post.id, {
      userNewfeed: {
        connect: userNewfeed,
      },
    });

    return user;
  }

  async editPost(userId: number, editPostDto: EditPostDto) {
    const post = await this.prismaService.post.findFirst({
      where: {
        AND: [
          {
            id: editPostDto.postId,
          },
          {
            userId,
          },
        ],
      },
    });

    if (!post)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    delete editPostDto.postId;

    const updatedPost = await this.updateOne(post.id, {
      ...editPostDto,
      updatedAt: new Date(),
    });

    return updatedPost;
  }

  async deletePost(postId: number) {
    const post = await this.prismaService.post.findUnique({
      where: {
        id: postId,
      },
    });
    if (!post)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    await this.deleteOne(post.id, true);

    return post;
  }

  async getPostReactions(postId: number) {
    const post = await this.findOne({
      where: {
        id: postId,
      },
    });

    if (!post)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const reactions = await this.findAll({
      where: {
        postId,
      },
      include: {
        user: true,
      },
      modelName: 'reaction',
    });

    return reactions;
  }

  async getPostComments(postId: number) {
    const post = await this.findOne({
      where: {
        id: postId,
      },
    });
    if (!post)
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    const comments = await this.findAll({
      where: {
        AND: [
          {
            postId,
          },
          {
            replyId: {
              equals: null,
            },
          },
        ],
      },
      include: {
        user: true,
        tags: true,
      },
      modelName: 'comment',
    });

    return comments;
  }
}
