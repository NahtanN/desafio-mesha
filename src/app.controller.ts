import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorator';
import { HttpResponse } from './utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiResponse({
    status: 200,
    schema: {
      example: {
        code: 200,
        message: 'API funcionando!',
        data: 'Tudo Ok!',
      },
    },
  })
  @Public()
  @Get()
  getHello(): HttpResponse {
    const hello = this.appService.getHello();

    return HttpResponse.ok('API funcionando!', hello);
  }
}
