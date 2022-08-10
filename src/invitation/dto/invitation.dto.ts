import { IsNumber, IsNumberString } from 'class-validator';

export class CreateInvitationDto {
  @IsNumber()
  receiverId: number;
}

export class AcceptInvitationDto {
  @IsNumber()
  invitationId: number;
}

export class DeclineInvitationDto {
  @IsNumber()
  invitationId: number;
}
