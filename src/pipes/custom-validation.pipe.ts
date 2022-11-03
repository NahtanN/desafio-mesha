import {
  ArgumentMetadata,
  BadRequestException,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { HttpResponse } from 'src/utils/http-responses';

export class CustomValidationPipe extends ValidationPipe {
  public async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    try {
      return await super.transform(value, metadata);
    } catch (error) {
      if (error instanceof BadRequestException) {
        const messages = error.getResponse()['message'];

        throw HttpResponse.unprocessableEntity(
          'Não foi possivel validar.',
          messages,
        );
      }
    }
  }
}
