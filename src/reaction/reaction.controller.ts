import { Body, Controller, Delete, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import {
  CreateReactionDto,
  DeleteReactionDto,
  UpdateReactionDto,
} from './dto/reaction.dto';
import { ReactionService } from './reaction.service';

@Controller('reaction')
@UseGuards(AuthGuard('jwt'))
export class ReactionController {
  constructor(private reactionService: ReactionService) {}

  @Post('create')
  async createReaction(
    @GetUser() user,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.reactionService.createReaction(createReactionDto);
  }

  @Put('update')
  async updateReaction(@Body() updateReactionDto: UpdateReactionDto) {
    return this.reactionService.updateReaction(updateReactionDto);
  }

  @Delete('delete')
  async deleteReaction(@Body() deleteReactionDto: DeleteReactionDto) {
    return this.reactionService.deleteReaction(deleteReactionDto);
  }
}
