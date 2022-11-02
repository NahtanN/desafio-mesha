import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TimeMeasures } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EmployeeService } from '../../employee.service';

describe('Teste de integração do Employee Service', () => {
  let prisma: PrismaService;
  let employeeService: EmployeeService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    employeeService = moduleRef.get(EmployeeService);

    await prisma.cleanDatabase();
  });

  describe('calculateTimeElapsed()', () => {
    it('Deve calcular o tempo decorrido entre o inicio e final de um atendimento', () => {
      const startedInSeconds = new Date();
      startedInSeconds.setSeconds(startedInSeconds.getSeconds() - 35);
      const secondsElapsed =
        employeeService.calculateTimeElapsed(startedInSeconds);

      expect(typeof secondsElapsed.endedIn).toBe('object');
      expect(typeof secondsElapsed.totalAttendanceTime).toBe('number');
      expect(secondsElapsed.attendanceTimeMeasure).toBe(TimeMeasures.SECONDS);

      const startedInMinutes = new Date();
      startedInMinutes.setMinutes(startedInMinutes.getMinutes() - 3);
      const minutesElapsed =
        employeeService.calculateTimeElapsed(startedInMinutes);

      expect(typeof minutesElapsed.endedIn).toBe('object');
      expect(typeof minutesElapsed.totalAttendanceTime).toBe('number');
      expect(minutesElapsed.attendanceTimeMeasure).toBe(TimeMeasures.MINUTE);

      const startedInHours = new Date();
      startedInHours.setHours(startedInHours.getHours() - 5);
      const hoursElapsed = employeeService.calculateTimeElapsed(startedInHours);

      expect(typeof hoursElapsed.endedIn).toBe('object');
      expect(typeof hoursElapsed.totalAttendanceTime).toBe('number');
      expect(hoursElapsed.attendanceTimeMeasure).toBe(TimeMeasures.HOUR);

      const startedInDays = new Date();
      startedInDays.setDate(startedInDays.getDate() - 1);
      const daysElapsed = employeeService.calculateTimeElapsed(startedInDays);

      expect(typeof daysElapsed.endedIn).toBe('object');
      expect(typeof daysElapsed.totalAttendanceTime).toBe('number');
      expect(daysElapsed.attendanceTimeMeasure).toBe(TimeMeasures.DAY);
    });
  });
});
