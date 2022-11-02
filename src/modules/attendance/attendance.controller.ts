import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpResponse } from 'src/utils';
import { GetCurrentUser, NotAuthorized, UserType } from '../auth/decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiTags('Attendance')
  @ApiResponse({
    description: 'Retorna os atendimentos que ainda nao foram iniciados',
    status: 200,
    schema: {
      example: {
        code: 200,
        message: 'Atendimentos retornados com sucesso!',
        data: [
          {
            id: 1,
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
        ],
      },
    },
  })
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

  @ApiTags('Attendance')
  @ApiBody({
    type: CreateAttendanceDto,
    description: 'Array com um ou mais IDs que representam os servicos',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        code: 201,
        message: 'Atendimento criado!',
        data: {
          id: 2,
          Client: {
            name: 'Teste 10',
            email: 'asf@hfgd.com',
          },
          totalValue: 12376,
          createdAt: '2022-11-02T21:24:42.752Z',
        },
      },
    },
  })
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
