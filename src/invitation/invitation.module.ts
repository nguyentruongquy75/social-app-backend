import { Module } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { InvitationController } from './invitation.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [InvitationService, PrismaService],
  controllers: [InvitationController],
})
export class InvitationModule {}
