import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import {
  AcceptInvitationDto,
  CreateInvitationDto,
  DeclineInvitationDto,
} from './dto';
import { InvitationService } from './invitation.service';

@Controller('invitations')
export class InvitationController {
  constructor(private invitationService: InvitationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getFriendInvitations(@GetUser() user, @Query('user') userId: number) {
    const id = userId ?? user.id;
    return await this.invitationService.getFriendInvitations(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async sendFriendInvitation(
    @GetUser() user,
    @Body() createInvitationDto: CreateInvitationDto,
  ) {
    return await this.invitationService.sendFriendInvitation(
      user.id,
      createInvitationDto.receiverId,
    );
  }

  @Put('accept')
  async acceptFriendInvitation(
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ) {
    return await this.invitationService.acceptFriendInvitation(
      acceptInvitationDto.invitationId,
    );
  }

  @Delete('decline')
  async declineFriendInvitation(
    @Body() declineFriendInvitationDto: DeclineInvitationDto,
  ) {
    return await this.invitationService.declineFriendInvation(
      declineFriendInvitationDto.invitationId,
    );
  }
}
