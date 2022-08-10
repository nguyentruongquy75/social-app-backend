import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  INVALID_INVITATION_ID,
  INVITATION_STATUS,
  ITEM_EXIST,
} from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@crud('invitation')
export class InvitationService extends CrudService {
  constructor(private prismaService: PrismaService) {
    super(prismaService);
  }

  async getFriendInvitations(userId: number) {
    const friendInvitations = await this.findAll({
      where: {
        receiverId: {
          equals: userId,
        },
      },
      include: {
        receiver: true,
        sender: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return friendInvitations;
  }

  async sendFriendInvitation(senderId: number, receiverId: number) {
    const existedInvitation = await this.prismaService.invitation.findFirst({
      where: {
        AND: [
          {
            receiverId: {
              equals: receiverId,
            },
          },
          {
            senderId: {
              equals: senderId,
            },
          },
          {
            status: {
              equals: INVITATION_STATUS.PENDING,
            },
          },
        ],
      },
    });

    if (existedInvitation) {
      throw new HttpException(ITEM_EXIST, HttpStatus.BAD_REQUEST);
    }

    const newInvitation = await this.createOne({
      receiver: {
        connect: {
          id: receiverId,
        },
      },
      sender: {
        connect: {
          id: senderId,
        },
      },
      status: INVITATION_STATUS.PENDING,
    });

    await this.prismaService.user.update({
      where: {
        id: receiverId,
      },
      data: {
        friendInvitations: {
          connect: {
            id: newInvitation.id,
          },
        },
      },
    });

    return newInvitation;
  }

  async acceptFriendInvitation(invitationId: number) {
    const invitation = await this.findOne({
      where: {
        id: invitationId,
      },
    });
    if (!invitation)
      throw new HttpException(INVALID_INVITATION_ID, HttpStatus.BAD_REQUEST);

    const updatedInvitation = await this.updateOne(invitationId, {
      status: INVITATION_STATUS.ACCEPTED,
    });

    const updateFriendPromise = [
      updatedInvitation.senderId,
      updatedInvitation.receiverId,
    ].map((id) =>
      this.prismaService.user.update({
        where: {
          id,
        },
        data: {
          friends: {
            connect: {
              id:
                id === updatedInvitation.senderId
                  ? updatedInvitation.receiverId
                  : updatedInvitation.senderId,
            },
          },
        },
      }),
    );

    await Promise.all(updateFriendPromise);

    return updatedInvitation;
  }

  async declineFriendInvation(invitationId: number) {
    const invitation = await this.findOne({
      where: {
        id: invitationId,
      },
    });
    if (!invitation)
      throw new HttpException(INVALID_INVITATION_ID, HttpStatus.BAD_REQUEST);

    const deletedInvitation = await this.deleteOne(invitationId, true);

    return deletedInvitation;
  }
}
