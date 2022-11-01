import { Body, Controller, Get, Post } from '@nestjs/common';
import { HttpResponse } from 'src/utils';
import { AttendanceService } from './attendance.service';
import { CreateAttendance } from './dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  async getAttendances(): Promise<HttpResponse> {
    const attendances = await this.attendanceService.findMany(
      {
        deletedAt: null,
        employeeId: null,
      },
      {
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

  @Post()
  async createAttendances(
    @Body() createAttendanceBody: CreateAttendance,
  ): Promise<HttpResponse> {
    const { services } = createAttendanceBody;

    const { totalCommissionPercentage, totalCommissionValue, totalValue } =
      await this.attendanceService.cauculateAttendanceValues(services);

    const attendance = await this.attendanceService.create({
      Client: {
        connect: {
          id: 1,
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
    });

    return HttpResponse.created('Atendimento criado!', attendance);
  }
}
