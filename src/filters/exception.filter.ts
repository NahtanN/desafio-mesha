import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { HttpResponse } from 'src/utils/http-responses';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let responseData = HttpResponse.internalServerError();

    if (exception instanceof HttpResponse) {
      responseData = exception;
      status = exception.code;
    }

    return response.status(status).json(responseData);
  }
}
