import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Module({
  providers: [PostService, PrismaService, CloudinaryService],
  controllers: [PostController],
})
export class PostModule {}
