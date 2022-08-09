import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrudService } from './crud.service';

@Module({
  providers: [CrudService, PrismaService],
})
export class CrudModule {}
