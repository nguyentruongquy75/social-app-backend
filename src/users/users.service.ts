import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { INVALID_ID_PROVIDED, INVALID_USER_ID } from 'src/constants';
import { CrudService } from 'src/crud/crud.service';
import { crud } from 'src/crud/decorator/crud.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto } from './dto';

@Injectable()
@crud('user')
export class UsersService extends CrudService {
  constructor(private prismaService: PrismaService) {
    super(prismaService);
  }

  async getUserById(userId: number) {
    const user = await this.findOne({
      where: {
        id: userId,
      },
      include: {
        friends: true,
        posts: {
          include: {
            reactions: true,
            comments: true,
            tags: true,
          },
        },
      },
    });
    if (!user) throw new HttpException(INVALID_USER_ID, HttpStatus.BAD_REQUEST);

    return user;
  }

  async getSearchUsers(userId: number, search: string) {
    const friends = await this.findAll({
      where: {
        AND: [
          {
            fullName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            friends: {
              some: {
                id: {
                  equals: userId,
                },
              },
            },
          },
        ],
      },
    });

    const users = await this.findAll({
      where: {
        AND: [
          {
            fullName: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            friends: {
              none: {
                id: {
                  equals: userId,
                },
              },
            },
          },
        ],
      },
    });

    return {
      friends,
      users,
    };
  }

  async getFriends(userId: number) {
    const frineds = await this.findAll({
      where: {
        friends: {
          some: {
            id: {
              equals: userId,
            },
          },
        },
      },
    });
    return frineds;
  }

  async deleteFriend(userId: number, friendId: number) {
    const userFriendArray = [userId, friendId];

    const users = await Promise.all(
      userFriendArray.map((id) =>
        this.findOne({
          where: {
            id,
          },
        }),
      ),
    );

    if (users.includes(null))
      throw new HttpException(INVALID_ID_PROVIDED, HttpStatus.BAD_REQUEST);

    await Promise.all(
      userFriendArray.map((id) =>
        this.updateOne(id, {
          friends: {
            disconnect: {
              id: id === userId ? friendId : userId,
            },
          },
        }),
      ),
    );

    return 'delete friend';
  }

  async getNewsfeed(userId: number) {
    const newsfeed = await this.findAll({
      where: {
        userNewfeed: {
          some: {
            id: {
              equals: userId,
            },
          },
        },
      },
      modelName: 'post',
      include: {
        reactions: true,
        comments: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return newsfeed;
  }

  async getNotifications(userId: number) {
    const notifications = await this.findAll({
      where: {
        userId: userId,
      },
      include: {
        post: true,
        comment: {
          include: {
            user: true,
          },
        },
        reaction: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      modelName: 'notification',
    });

    const unreadNotificationCount = await this.prismaService.notification.count(
      {
        where: {
          AND: [
            {
              userId,
            },
            {
              isRead: false,
            },
          ],
        },
      },
    );

    return {
      ...notifications,
      unreadNotificationCount,
    };
  }

  async getPosts(userId: number) {
    const posts = await this.findAll({
      where: {
        userId: {
          equals: userId,
        },
      },
      include: {
        user: true,
        tags: true,
        reactions: true,
        comments: true,
      },
      modelName: 'post',
    });

    return posts;
  }

  async getChatRoom(userId: number) {
    const chatRooms = await this.findAll({
      where: {
        users: {
          some: {
            userId: {
              equals: userId,
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      modelName: 'chatRoom',
    });

    return chatRooms;
  }

  async getContacts(userId: number) {
    const contacts = await this.findAll({
      where: {
        AND: [
          {
            friends: {
              some: {
                id: {
                  equals: userId,
                },
              },
            },
          },
          {
            active: true,
          },
        ],
      },
    });

    return contacts;
  }

  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const checkUser = await this.findOne({
      where: {
        id: userId,
      },
    });

    if (!checkUser)
      throw new HttpException(INVALID_USER_ID, HttpStatus.BAD_REQUEST);

    const updatedUser = await this.updateOne(userId, updateUserDto);

    return updatedUser;
  }
}
