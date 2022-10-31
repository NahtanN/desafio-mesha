import { Body, Controller, Post } from '@nestjs/common';
import { Prisma, TimeMeasures } from '@prisma/client';
import { HttpResponse } from 'src/utils';
import { CreateServiceDto } from './dto';
import { ServiceService } from './service.service';

@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Post('/create')
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
