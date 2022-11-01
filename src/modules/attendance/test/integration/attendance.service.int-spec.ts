import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AttendanceService } from '../../attendance.service';

const services = [
  {
    name: 'servico 1',
    description: 'Descricao do servico 1',
    estimatedTime: 30,
    value: 10000,
    commissionPercentage: 10,
    commissionValue: 1000,
  },
  {
    name: 'servico 2',
    description: 'Descricao do servico 2',
    estimatedTime: 40,
    value: 12376,
    commissionPercentage: 17,
    commissionValue: 2104,
  },
  {
    name: 'servico 3',
    description: 'Descricao do servico 3',
    estimatedTime: 50,
    value: 25290,
    commissionPercentage: 14,
    commissionValue: 3541,
  },
];

const servicesResult = {
  totalValue: 47666,
  totalCommissionValue: 6645,
  totalCommissionPercentage: 1394,
};

describe('Teste de integração do Attendance Service', () => {
  let prisma: PrismaService;
  let attendanceService: AttendanceService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    attendanceService = moduleRef.get(AttendanceService);

    await prisma.cleanDatabase();
  });

  describe('cauculateAttendanceValues()', () => {
    const servicesId: number[] = [];

    it('Deve criar serviços que serão utilizados no atendimento', async () => {
      for (const serviceData of services) {
        const service = await prisma.service.create({
          data: serviceData,
        });

        servicesId.push(service.id);
      }
    });

    it('Deve calcular o total do atendimento tendo como base os serviços escolhidos', async () => {
      const result = await attendanceService.cauculateAttendanceValues(
        servicesId,
      );

      expect(result.totalValue).toBe(servicesResult.totalValue);
      expect(result.totalCommissionValue).toBe(
        servicesResult.totalCommissionValue,
      );
      expect(result.totalCommissionPercentage).toBe(
        servicesResult.totalCommissionPercentage,
      );
    });
  });
});
