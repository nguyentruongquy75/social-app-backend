import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  DeleteFriendDto,
  UpdateUserDto,
  UpdateUserFileDto,
} from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private userService: UsersService,
    private cloudinary: CloudinaryService,
  ) {}

  @Get('search/:id')
  async getUserById(@Param('id') userId: number) {
    return await this.userService.getUserById(userId);
  }

  @Get('search')
  async getUsers(@Query('q') search: string, @GetUser() user) {
    return await this.userService.getSearchUsers(user.id, search);
  }

  @Get('friends')
  async getFriends(@GetUser() user) {
    return await this.userService.getFriends(user.id);
  }

  @Get('contacts')
  async getContacts(@GetUser() user) {
    return await this.userService.getContacts(user.id);
  }

  @Get('/:id/friends')
  async getUserFriends(@Param('id') id: number) {
    return await this.userService.getFriends(id);
  }

  @Delete('/friends/delete')
  async deleteFriend(
    @GetUser() user,
    @Body() deleteFriendDto: DeleteFriendDto,
  ) {
    return await this.userService.deleteFriend(
      user.id,
      deleteFriendDto.friendId,
    );
  }

  @Get('newsfeed')
  async getNewsfeed(@GetUser() user) {
    return await this.userService.getNewsfeed(user.id);
  }

  @Get('notifications')
  async getNotifications(@GetUser() user) {
    return await this.userService.getNotifications(user.id);
  }

  @Get('posts')
  async getPosts(@GetUser() user) {
    return await this.userService.getPosts(user.id);
  }

  @Get('/:id/posts')
  async getSpecificUserPosts(@Param('id') userId: number) {
    return await this.userService.getPosts(userId);
  }

  @Get('chatrooms')
  async getChatRooms(@GetUser() user) {
    return await this.userService.getChatRoom(user.id);
  }

  @Put('update')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'avatarImage',
        maxCount: 1,
      },
      {
        name: 'coverImage',
        maxCount: 1,
      },
    ]),
  )
  async updateUser(
    @GetUser() user,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() files: UpdateUserFileDto,
  ) {
    if (files) {
      if (files.avatarImage) {
        const url = await this.cloudinary.upload(files.avatarImage[0]);
        updateUserDto.avatarImage = url;
      }

      if (files.coverImage) {
        const url = await this.cloudinary.upload(files.coverImage[0]);
        updateUserDto.coverImage = url;
      }
    }
    return await this.userService.updateUser(user.id, updateUserDto);
  }
}
