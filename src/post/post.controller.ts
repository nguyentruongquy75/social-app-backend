import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CreatePostDto, DeletePostDto, EditPostDto } from './dto';
import { PostService } from './post.service';

@Controller('post')
@UseGuards(AuthGuard('jwt'))
export class PostController {
  constructor(private postService: PostService) {}

  @Get(':id')
  async getPostById(@Param('id') postId: number) {
    return await this.postService.getPostById(postId);
  }

  @Post('create')
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postService.createPost(createPostDto);
  }

  @Put('edit')
  async editPost(@GetUser() user, @Body() editPostDto: EditPostDto) {
    return await this.postService.editPost(user.id, editPostDto);
  }

  @Delete('delete')
  async deletePost(@Body() deletePostDto: DeletePostDto) {
    return await this.postService.deletePost(deletePostDto.postId);
  }

  @Get(':id/reactions')
  async getPostReactions(@Param('id') postId: number) {
    return await this.postService.getPostReactions(postId);
  }

  @Get(':id/comments')
  async getPostComments(@Param('id') postId: number) {
    return await this.postService.getPostComments(postId);
  }
}
