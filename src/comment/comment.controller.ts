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
import { CommentService } from './comment.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Controller('comment')
@UseGuards(AuthGuard('jwt'))
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':id/replies')
  async getCommentReplies(@Param('id') commentId: number) {
    return this.commentService.getCommentReplies(commentId);
  }

  @Post('create')
  async createComment(@Body() createCommentDto: CreateCommentDto) {
    return this.commentService.createComment(createCommentDto);
  }

  @Put(':id/update')
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return await this.commentService.updateComment(commentId, updateCommentDto);
  }

  @Delete(':id/delete')
  async deleteComment(@Param('id') commentId: number) {
    return this.commentService.deleteComment(commentId);
  }

  @Get(':id/reactions')
  async getCommentReactions(@Param('id') commentId: number) {
    return await this.commentService.getCommentReactions(commentId);
  }

  @Get(':id/reactions/:type')
  async getCommentReactionsByType(
    @Param('id') commentId: number,
    @Param('type') type: string,
  ) {
    return await this.commentService.getCommentReactionsByType(commentId, type);
  }
}
