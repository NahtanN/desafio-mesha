import { Body, Controller, Post } from '@nestjs/common';
import { HttpResponse } from 'src/utils';
import { AttendanceService } from './attendance.service';
import { CreateAttendance } from './dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async create(
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
