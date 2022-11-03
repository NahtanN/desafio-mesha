import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import {
  createAttendance,
  createServices,
  seedTestDataBase,
} from './orchestrator';
import { EmployeeRouteUrl, SigninRouteUrl } from './routes';
import * as request from 'supertest';
import { HttpResponse } from 'src/utils';

describe('EmployeeController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let clientLogedIn;
  let employeeLogedIn;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();

    await seedTestDataBase();
    await createServices();

    const clientResponse = await request(app.getHttpServer())
      .post(SigninRouteUrl)
      .send({
        email: 'test1@test.com',
        password: '123456',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201);

    const { data: clientData } = clientResponse.body as HttpResponse;
    clientLogedIn = clientData;

    // Faz o login com o usuario do tipo "employee"
    const employeeResponse = await request(app.getHttpServer())
      .post(SigninRouteUrl)
      .send({
        email: 'test2@test.com',
        password: '123456',
        type: 'employee',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(201);

    const { data: employeeData } = employeeResponse.body as HttpResponse;
    employeeLogedIn = employeeData;
  });

  describe(`${EmployeeRouteUrl}/start/:id (POST)`, () => {
    it('Deve iniciar um atendimento', async () => {
      const attendanceId = await createAttendance();

      return request(app.getHttpServer())
        .patch(`${EmployeeRouteUrl}/start/${attendanceId}`)
        .set('Authorization', `Bearer ${employeeLogedIn.access_token}`)
        .expect(200)
        .then((response) => {
          const { data, message } = response.body as HttpResponse;

          expect(message).toBe('Atendimento iniciado!');
          expect(data).toStrictEqual({
            startedIn: expect.any(String),
            Client: { name: 'asdf', email: 'asdf@asdf.com' },
            AttendanceServices: [
              {
                Service: {
                  name: 'servico 1',
                  description: 'Descricao do servico 1',
                  estimatedTime: 50,
                  timeMeasure: 'MINUTE',
                },
              },
            ],
          });
        });
    });

    it('Deve finalizar um atendimento', async () => {
      const attendanceId = await createAttendance();

      await request(app.getHttpServer())
        .patch(`${EmployeeRouteUrl}/start/${attendanceId}`)
        .set('Authorization', `Bearer ${employeeLogedIn.access_token}`)
        .expect(200);

      return request(app.getHttpServer())
        .patch(`${EmployeeRouteUrl}/end/${attendanceId}`)
        .set('Authorization', `Bearer ${employeeLogedIn.access_token}`)
        .expect(200)
        .then((response) => {
          const { data, message } = response.body as HttpResponse;

          expect(message).toBe('Atendimento finalizado!');
          expect(data).toStrictEqual({
            startedIn: expect.any(String),
            endedIn: expect.any(String),
            totalCommissionValue: 6456,
            totalAttendanceTime: 0,
            attendanceTimeMeasure: 'SECONDS',
            Client: { name: 'asdf', email: 'asdf@asdf.com' },
            AttendanceServices: [
              {
                Service: {
                  name: 'servico 1',
                  description: 'Descricao do servico 1',
                  estimatedTime: 50,
                  timeMeasure: 'MINUTE',
                },
              },
            ],
          });
        });
    });

    it('Deve tentar iniciar um atendimento a partir de uma conta do tipo "client"', async () => {
      const attendanceId = await createAttendance();

      return request(app.getHttpServer())
        .patch(`${EmployeeRouteUrl}/start/${attendanceId}`)
        .set('Authorization', `Bearer ${clientLogedIn.access_token}`)
        .expect(403)
        .then((response) => {
          const { message } = response.body as HttpResponse;

          expect(message).toBe('Acesso não autorizado!');
        });
    });

    it('Deve tentar finalizar um atendimento a partir de uma conta do tipo "client"', async () => {
      const attendanceId = await createAttendance();

      await request(app.getHttpServer())
        .patch(`${EmployeeRouteUrl}/start/${attendanceId}`)
        .set('Authorization', `Bearer ${employeeLogedIn.access_token}`)
        .expect(200);

      return request(app.getHttpServer())
        .patch(`${EmployeeRouteUrl}/end/${attendanceId}`)
        .set('Authorization', `Bearer ${clientLogedIn.access_token}`)
        .expect(403)
        .then((response) => {
          const { message } = response.body as HttpResponse;

          expect(message).toBe('Acesso não autorizado!');
        });
    });
  });

  afterAll(async () => {
    await prisma.attendanceServices.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.service.deleteMany();
    await prisma.client.deleteMany();
    await prisma.employee.deleteMany();
  });
});
