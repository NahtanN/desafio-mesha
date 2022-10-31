import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService) {}

  async find(where: Prisma.ServiceWhereInput, select?: Prisma.ServiceSelect) {
    try {
      return await this.prismaService.service.findFirst({
        where,
        select,
      });
    } catch (err) {
      throw HttpResponse.internalServerError(err);
    }
  }

  async create(data: Prisma.ServiceCreateInput) {
    try {
      return await this.prismaService.service.create({
        data,
      });
    } catch (err) {
      throw HttpResponse.internalServerError(err);
    }
  }
}
