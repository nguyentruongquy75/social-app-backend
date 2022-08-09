import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { CrudModule } from './crud/crud.module';
import { CrudService } from './crud/crud.service';

@Module({
  imports: [AuthModule, CrudModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, CrudService],
})
export class AppModule {}
