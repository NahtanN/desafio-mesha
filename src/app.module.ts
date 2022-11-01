import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ServiceModule } from './modules/service/service.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { EmployeeModule } from './modules/employee/employee.module';

@Module({
  imports: [PrismaModule, ServiceModule, AttendanceModule, EmployeeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
