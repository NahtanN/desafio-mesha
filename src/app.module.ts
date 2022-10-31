import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ServiceModule } from './modules/service/service.module';

@Module({
  imports: [PrismaModule, ServiceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
