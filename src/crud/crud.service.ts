import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindDto } from './dto';

@Injectable()
export class CrudService {
  modelName: string;
  constructor(private prisma: PrismaService) {}

  async findOne(params: FindDto) {
    const { where, include, select, orderBy } = params;

    const queryBuilder = {
      where,
      include,
      select,
      orderBy,
    };

    if (!where) delete queryBuilder.where;
    if (!include) delete queryBuilder.include;
    if (!select) delete queryBuilder.select;
    if (!orderBy) delete queryBuilder.orderBy;

    return await this.prisma[this.modelName].findUnique(queryBuilder);
  }

  async findAll(params: FindDto) {
    let { where, include, select, orderBy, page, size, modelName } = params;

    modelName = modelName ?? this.modelName;

    const take = size ?? 10;
    page = page ?? -1;
    let skip = page < 0 ? page : (page - 1) * take;

    const queryBuilder = {
      where,
      include,
      select,
      orderBy,
      skip,
      take,
    };

    if (!where) delete queryBuilder.where;
    if (!include) delete queryBuilder.include;
    if (!select) delete queryBuilder.select;
    if (!orderBy) delete queryBuilder.orderBy;
    // get all data
    if (skip === -1) {
      delete queryBuilder.skip;
      delete queryBuilder.take;
    }

    const items = await this.prisma[modelName].findMany(queryBuilder);

    const total = await this.prisma[modelName].count({
      where: queryBuilder.where,
    });

    const totalPages = Math.ceil(total / take);
    const prevPage = page > 1 ? page - 1 : 1;
    const nextPage = page < totalPages ? page + 1 : totalPages;

    return {
      items,
      total,
      totalPages,
      nextPage,
      prevPage,
    };
  }

  async createOne(createDto: any) {
    return await this.prisma[this.modelName].create({
      data: createDto,
    });
  }

  async createMany(createDto: any[], skipDuplicates = true) {
    return await this.prisma[this.modelName].createMany({
      data: createDto,
      skipDuplicates,
    });
  }

  async updateOne(id: number | string, updateDto: any) {
    const where = {
      id,
    };

    return await this.prisma[this.modelName].update({
      where,
      data: updateDto,
    });
  }

  async updateMany(where: any, updateDto: any) {
    return await this.prisma[this.modelName].updateMany({
      where,
      data: updateDto,
    });
  }

  async deleteOne(id: number | string, isForceDeleted = false) {
    if (isForceDeleted) {
      return await this.prisma[this.modelName].delete({
        where: {
          id,
        },
      });
    }
    return await this.prisma[this.modelName].update({
      where: {
        id,
      },
      data: {
        deleteAt: new Date(),
      },
    });
  }

  async deleteMany(id: number | string, isForceDeleted = false) {
    if (isForceDeleted) {
      return await this.prisma[this.modelName].deleteMany({
        where: {
          id,
        },
      });
    }
    return await this.prisma[this.modelName].updateMany({
      where: {
        id,
      },
      data: {
        deleteAt: new Date(),
      },
    });
  }
}
