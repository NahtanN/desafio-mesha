import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { HttpResponse } from 'src/utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prismaService: PrismaService) {}

  async find(where: Prisma.ClientWhereInput, select?: Prisma.ClientSelect) {
    try {
      return await this.prismaService.client.findFirst({
        where,
        select,
      });
    } catch (err) {
      throw HttpResponse.internalServerError(err);
    }
  }

  async create(data: Prisma.ClientCreateInput) {
    try {
      return await this.prismaService.client.create({
        data,
      });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw HttpResponse.badRequest('Email já em uso!', err);
      } else {
        throw HttpResponse.internalServerError(err);
      }
    }
  }
}
