import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: Prisma.ServiceCreateInput) {
    try {
      return await this.prismaService.service.create({
        data,
      });
    } catch (err) {
      console.log(err);
      throw HttpResponse.internalServerError(err);
    }
  }
}
