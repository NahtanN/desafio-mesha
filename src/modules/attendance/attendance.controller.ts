import { Body, Controller, Get, Post } from '@nestjs/common';
import { HttpResponse } from 'src/utils';
import { GetCurrentUser, NotAuthorized, UserType } from '../auth/decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @NotAuthorized(UserType.CLIENT)
  @Get()
  async getAttendances(): Promise<HttpResponse> {
    const attendances = await this.attendanceService.findMany(
      {
        deletedAt: null,
        employeeId: null,
      },
      {
        id: true,
        Client: {
          select: {
            name: true,
            email: true,
          },
        },
        AttendanceServices: {
          select: {
            Service: {
              select: {
                name: true,
                description: true,
                estimatedTime: true,
                timeMeasure: true,
              },
            },
          },
        },
      },
    );

    return HttpResponse.ok('Atendimentos retornados com sucesso!', attendances);
  }

  @NotAuthorized(UserType.EMPLOYEE)
  @Post()
  async createAttendances(
    @GetCurrentUser('sub') sub: number,
    @Body() createAttendanceBody: CreateAttendanceDto,
  ): Promise<HttpResponse> {
    const { services } = createAttendanceBody;

    const { totalCommissionPercentage, totalCommissionValue, totalValue } =
      await this.attendanceService.cauculateAttendanceValues(services);

    const attendance = await this.attendanceService.create(
      {
        Client: {
          connect: {
            id: sub,
          },
        },
        AttendanceServices: {
          createMany: {
            data: services.map((serviceId) => ({ serviceId })),
          },
        },
        totalCommissionPercentage,
        totalCommissionValue,
        totalValue,
      },
      {
        id: true,
        Client: {
          select: {
            name: true,
            email: true,
          },
        },
        totalValue: true,
        createdAt: true,
      },
    );

    return HttpResponse.created('Atendimento criado!', attendance);
  }
}
