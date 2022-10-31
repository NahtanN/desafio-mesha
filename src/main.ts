import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/exception.filter';

const port = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefixer = 'api';

  app.enableCors();
  app.setGlobalPrefix(globalPrefixer);

  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port, () =>
    Logger.log(`Listening at http://localhost:${port}/${globalPrefixer}`),
  );
}
bootstrap();
