import { Controller, Param, Patch } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Attendance } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { AttendanceService } from '../attendance/attendance.service';
import { GetCurrentUser, NotAuthorized, UserType } from '../auth/decorator';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly employeeService: EmployeeService,
  ) {}

  @ApiTags('Employee')
  @ApiResponse({
    description: 'Inicia um atendimento',
    status: 200,
    schema: {
      example: {
        code: 200,
        message: 'Atendimento iniciado!',
        data: {
          startedIn: '2022-11-02T23:05:37.164Z',
          Client: {
            name: 'Teste 10',
            email: 'asf@hfgd.com',
          },
          AttendanceServices: [
            {
              Service: {
                name: 'servico 10',
                description: 'Descricao do servico 4',
                estimatedTime: 50,
                timeMeasure: 'MINUTE',
              },
            },
          ],
        },
      },
    },
  })
  @NotAuthorized(UserType.CLIENT)
  @Patch('/attendance/start/:id')
  async startAttendance(
    @GetCurrentUser('sub') sub: number,
    @Param('id') id: string,
  ): Promise<HttpResponse> {
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
            id: sub,
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

  @ApiTags('Employee')
  @ApiResponse({
    description: 'Finaliza um atendimento',
    status: 200,
    schema: {
      example: {
        code: 200,
        message: 'Atendimento finalizado!',
        data: {
          startedIn: '2022-11-02T23:05:37.164Z',
          endedIn: '2022-11-02T23:06:36.550Z',
          totalCommissionValue: 2104,
          totalAttendanceTime: 59,
          attendanceTimeMeasure: 'SECONDS',
          Client: {
            name: 'Teste 10',
            email: 'asf@hfgd.com',
          },
          AttendanceServices: [
            {
              Service: {
                name: 'servico 10',
                description: 'Descricao do servico 4',
                estimatedTime: 50,
                timeMeasure: 'MINUTE',
              },
            },
          ],
        },
      },
    },
  })
  @NotAuthorized(UserType.CLIENT)
  @Patch('/attendance/end/:id')
  async endAttendance(
    @GetCurrentUser('sub') sub: number,
    @Param('id') id: string,
  ): Promise<HttpResponse> {
    const attendanceId = parseInt(id);

    const attendance: Partial<Attendance> = await this.attendanceService.find({
      id: attendanceId,
      employeeId: sub,
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
