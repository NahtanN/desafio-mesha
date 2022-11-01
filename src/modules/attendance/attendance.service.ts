import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceService } from '../service/service.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly serviceService: ServiceService,
  ) {}

  async update(
    where: Prisma.AttendanceWhereUniqueInput,
    data: Prisma.AttendanceUpdateInput,
    select?: Prisma.AttendanceSelect,
  ) {
    try {
      return await this.prismaService.attendance.update({
        where,
        data,
        select,
      });
    } catch (err) {
      console.log(err);
      throw HttpResponse.internalServerError(err);
    }
  }

  async find(
    where: Prisma.AttendanceWhereInput,
    select?: Prisma.AttendanceSelect,
  ) {
    try {
      return await this.prismaService.attendance.findFirst({
        where,
        select,
      });
    } catch (err) {
      console.log(err);
      throw HttpResponse.internalServerError(err);
    }
  }

  async create(data: Prisma.AttendanceCreateInput) {
    try {
      return await this.prismaService.attendance.create({ data });
    } catch (err) {
      throw HttpResponse.internalServerError(err);
    }
  }

  async cauculateAttendanceValues(servicesId: number[]) {
    let totalValue = 0;
    let totalCommissionValue = 0;

    // Buscar os servicos
    for (const id of servicesId) {
      const service = (await this.serviceService.find(
        {
          id,
        },
        {
          value: true,
          commissionValue: true,
        },
      )) as {
        value: number;
        commissionValue: number;
      };

      totalValue += service.value;
      totalCommissionValue += service.commissionValue;
    }

    const totalCommissionPercentage = parseInt(
      ((totalCommissionValue * 100) / totalValue).toFixed(2).replace('.', ''),
    );

    return {
      totalValue,
      totalCommissionValue,
      totalCommissionPercentage,
    };
  }
}
