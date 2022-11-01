import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorator';
import { HttpResponse } from './utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): HttpResponse {
    const hello = this.appService.getHello();

    return HttpResponse.ok('API funcionando!', hello);
  }
}
