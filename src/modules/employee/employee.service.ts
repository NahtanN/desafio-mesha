import { Injectable } from '@nestjs/common';
import { Prisma, TimeMeasures } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private readonly prismaService: PrismaService) {}

  async find(where: Prisma.EmployeeWhereInput, select?: Prisma.EmployeeSelect) {
    try {
      return await this.prismaService.employee.findFirst({
        where,
        select,
      });
    } catch (err) {
      throw HttpResponse.internalServerError(err);
    }
  }

  async create(data: Prisma.EmployeeCreateInput) {
    try {
      return await this.prismaService.employee.create({ data });
    } catch (err) {
      console.log(err);
      throw HttpResponse.internalServerError(err);
    }
  }

  calculateTimeElapsed(startedIn: Date) {
    const startedInDate = new Date(startedIn);
    const endedIn = new Date();

    let totalTime = endedIn.getTime() - startedInDate.getTime();

    // Remove os milisegundos
    totalTime /= 1000;

    const seconds = Math.round(totalTime);

    let totalAttendanceTime: number;
    let attendanceTimeMeasure: TimeMeasures;

    if (seconds / 60 <= 1) {
      totalAttendanceTime = seconds;
      attendanceTimeMeasure = 'SECONDS';
    } else if (seconds / 60 >= 1 && seconds / 3600 < 1) {
      totalAttendanceTime = Math.trunc(seconds / 60);
      attendanceTimeMeasure = 'MINUTE';
    } else if (seconds / 3600 >= 1 && seconds / 86400 < 1) {
      totalAttendanceTime = Math.trunc(seconds / 3600);
      attendanceTimeMeasure = 'HOUR';
    } else {
      totalAttendanceTime = Math.trunc(seconds / 86400);
      attendanceTimeMeasure = 'DAY';
    }

    return {
      endedIn,
      totalAttendanceTime,
      attendanceTimeMeasure,
    };
  }
}
