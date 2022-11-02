import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/exception.filter';
import { CustomValidationPipe } from './pipes/custom-validation.pipe';

const port = process.env.PORT;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefixer = 'api';

  app.enableCors();
  app.setGlobalPrefix(globalPrefixer);

  app.useGlobalPipes(new CustomValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Clínica')
    .setDescription('Documentação do Clínica')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port, () =>
    Logger.log(`Listening at http://localhost:${port}/${globalPrefixer}`),
  );
}
bootstrap();
