import { Controller, Param, Patch } from '@nestjs/common';
import { Attendance } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { AttendanceService } from '../attendance/attendance.service';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly employeeService: EmployeeService,
  ) {}

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

  @Patch('/attendance/end/:id')
  async endAttendance(@Param('id') id: string): Promise<HttpResponse> {
    // TODO: Alterar
    const employeeId = 1;

    const attendanceId = parseInt(id);

    const attendance: Partial<Attendance> = await this.attendanceService.find({
      id: attendanceId,
      employeeId,
      startedIn: {
        not: null,
      },
      endedIn: null,
    });

    if (!attendance) {
      return HttpResponse.badRequest('Atendimento não encontrado!');
    }

    const timeMeasures = this.employeeService.calculateTimeElapsed(
      attendance.startedIn,
    );

    const attendanceUpdated = await this.attendanceService.update(
      {
        id: attendanceId,
      },
      timeMeasures,
      {
        startedIn: true,
        endedIn: true,
        totalCommissionValue: true,
        totalAttendanceTime: true,
        attendanceTimeMeasure: true,
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

    return HttpResponse.ok('Atendimento finalizado!', attendanceUpdated);
  }
}
