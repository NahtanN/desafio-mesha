import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Prisma, TimeMeasures } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { NotAuthorized, UserType } from '../auth/decorator';
import { CreateServiceDto } from './dto';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @ApiTags('Service')
  @ApiHeader({
    name: 'Authorization',
    schema: {
      example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOj...',
    },
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        code: 200,
        message: 'Serviços retornado com sucesso!',
        data: [
          {
            name: 'servico 1',
            description: 'Descricao do servico 1',
            estimatedTime: 50,
            timeMeasure: 'MINUTE',
            value: 12376,
          },
          {
            name: 'servico 22',
            description: 'Descricao do servico 2',
            estimatedTime: 30,
            timeMeasure: 'MINUTE',
            value: 10000,
          },
        ],
      },
    },
  })
  @Get()
  async getServices(): Promise<HttpResponse> {
    const services = await this.serviceService.findMany(
      {
        deletedAt: null,
      },
      {
        name: true,
        description: true,
        estimatedTime: true,
        timeMeasure: true,
        value: true,
      },
    );

    return HttpResponse.ok('Serviços retornado com sucesso!', services);
  }

  @ApiTags('Service')
  @ApiHeader({
    name: 'Authorization',
    schema: {
      example: 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOj...',
    },
  })
  @ApiBody({
    type: CreateServiceDto,
    description:
      'O "value" deve ser um inteiro em centavos. Ex: R$ 135 reais deve ser representado como "13500"',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        code: 201,
        message: 'Servico criado!',
        data: {
          id: 1,
          name: 'servico 10',
          description: 'Descricao do servico 4',
          estimatedTime: 50,
          timeMeasure: 'MINUTE',
          value: 12376,
          commissionPercentage: 17,
          commissionValue: 2104,
          createdAt: '2022-11-02T21:23:42.751Z',
          updatedAt: '2022-11-02T21:23:42.751Z',
          deletedAt: null,
        },
      },
    },
  })
  @NotAuthorized(UserType.CLIENT)
  @Post()
  async createService(
    @Body() createServiceBody: CreateServiceDto,
  ): Promise<HttpResponse> {
    const {
      name,
      description,
      value,
      commissionPercentage,
      estimatedTime,
      timeMeasure,
    } = createServiceBody;

    // Calcula o valor da comissao
    const commissionValue = Math.round(value * (commissionPercentage / 100));

    let serviceData: Prisma.ServiceCreateInput = {
      name,
      description,
      value,
      commissionPercentage,
      estimatedTime,
      commissionValue,
    };

    if (timeMeasure) {
      serviceData = {
        ...serviceData,
        timeMeasure: timeMeasure as TimeMeasures,
      };
    }

    const newService = await this.serviceService.create(serviceData);

    return HttpResponse.created('Servico criado!', newService);
  }
}
