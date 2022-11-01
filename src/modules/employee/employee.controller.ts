import { Controller, Param, Patch } from '@nestjs/common';
import { HttpResponse } from 'src/utils';
import { AttendanceService } from '../attendance/attendance.service';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Patch('/attendance/start/:id')
  async startAttendance(@Param('id') id: string): Promise<HttpResponse> {
    const attendanceId = parseInt(id);

    const attendance = await this.attendanceService.find({
      id: attendanceId,
      employeeId: null,
    });

    if (!attendance) {
      return HttpResponse.badRequest('Atendimento não encontrado!');
    }

    const attendanceUpdated = await this.attendanceService.update(
      {
        id: attendanceId,
      },
      {
        Employee: {
          connect: {
            id: 1,
          },
        },
        startedIn: new Date(),
      },
      {
        startedIn: true,
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

    return HttpResponse.ok('Atendimento iniciado!', attendanceUpdated);
  }
}
