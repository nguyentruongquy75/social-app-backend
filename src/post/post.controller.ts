import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { getPublicIdImage } from 'src/shared/utils';
import { CreatePostDto, DeletePostDto, EditPostDto } from './dto';
import { PostService } from './post.service';

@Controller('post')
@UseGuards(AuthGuard('jwt'))
export class PostController {
  constructor(
    private postService: PostService,
    private cloudinaryService: CloudinaryService,
  ) {}

  @Get(':id')
  async getPostById(@Param('id') postId: number) {
    return await this.postService.getPostById(postId);
  }

  @UseInterceptors(FilesInterceptor('images'))
  @Post('create')
  async createPost(
    @GetUser() user,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const images = await Promise.all(
      files.map((file) => this.cloudinaryService.upload(file)),
    );

    createPostDto.images = images;

    return await this.postService.createPost({
      ...createPostDto,
      userId: user.id,
    });
  }

  @UseInterceptors(FilesInterceptor('images'))
  @Put('edit')
  async editPost(
    @GetUser() user,
    @Body() editPostDto: EditPostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // if (files.length > 0) {
    //   const post = await this.postService.getPostById(editPostDto.postId);

    //   post.images.forEach((image) =>
    //     this.cloudinaryService.delete(getPublicIdImage(image)),
    //   );

    //   const images = await Promise.all(
    //     files.map((file) => this.cloudinaryService.upload(file)),
    //   );

    //   editPostDto.images = images;
    // }

    // return await this.postService.editPost(user.id, editPostDto);

    return {
      files,
      editPostDto,
    };
  }

  @Delete('delete')
  async deletePost(@Body() deletePostDto: DeletePostDto) {
    return await this.postService.deletePost(deletePostDto.postId);
  }

  @Get(':id/reactions')
  async getPostReactions(@Param('id') postId: number) {
    return await this.postService.getPostReactions(postId);
  }

  @Get(':id/reactions/:type')
  async getPostReactionsByType(
    @Param('id') postId: number,
    @Param('type') type: string,
  ) {
    return await this.postService.getPostReactionsByType(postId, type);
  }

  @Get(':id/comments')
  async getPostComments(@Param('id') postId: number) {
    return await this.postService.getPostComments(postId);
  }
}
