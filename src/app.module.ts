import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ServiceModule } from './modules/service/service.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AtGuard } from './modules/auth/guards';
import { ClientModule } from './modules/client/client.module';
import { AccessControlGuard } from './modules/auth/guards/access-control.guard';
import { HttpExceptionFilter } from './filters/exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env${process.env.NODE_ENV}`,
    }),
    PrismaModule,
    ServiceModule,
    AttendanceModule,
    EmployeeModule,
    AuthModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AccessControlGuard,
    },
    AppService,
  ],
})
export class AppModule {}
