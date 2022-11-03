import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { HttpResponse } from 'src/utils';
import * as request from 'supertest';
import { createServices, seedTestDataBase } from './orchestrator';
import { AttendanceRouteUrl, SigninRouteUrl } from './routes';

describe('AttendanceController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  let clientLogedIn;
  let employeeLogedIn;
  let servicesIds;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();
    await seedTestDataBase();
    servicesIds = await createServices();

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

  describe(`${AttendanceRouteUrl} (POST)`, () => {
    it('Deve criar um atendimento com o usuario do tipo "client"', async () => {
      await request(app.getHttpServer())
        .post(AttendanceRouteUrl)
        .send({
          services: servicesIds,
        })
        .set('Authorization', `Bearer ${clientLogedIn.access_token}`)
        .expect(201)
        .then((response) => {
          const { data, message } = response.body as HttpResponse;

          expect(message).toBe('Atendimento criado!');
          expect(data).not.toStrictEqual({
            id: 1,
            Client: {
              name: 'Test 1',
              email: 'test1@test.com',
            },
            totalValue: 24752,
            createdAt: expect.any(Date),
          });
        });
    });

    it('Deve tentar criar um atendimento com o usuario do tipo "employee", porem sem sucesso', async () => {
      await request(app.getHttpServer())
        .post(AttendanceRouteUrl)
        .send({
          services: servicesIds,
        })
        .set('Authorization', `Bearer ${employeeLogedIn.access_token}`)
        .expect(403)
        .then((response) => {
          const { message } = response.body as HttpResponse;

          expect(message).toBe('Acesso não autorizado!');
        });
    });
  });

  describe(`${AttendanceRouteUrl} (GET)`, () => {
    it('Deve tentar receber os atendimentos em aberto a partir de uma conta do tipo "cliente", porem sem sucesso', async () => {
      await request(app.getHttpServer())
        .get(AttendanceRouteUrl)
        .set('Authorization', `Bearer ${clientLogedIn.access_token}`)
        .expect(403)
        .then((response) => {
          const { message } = response.body as HttpResponse;

          expect(message).toBe('Acesso não autorizado!');
        });
    });

    it('Deve tentar receber os atendimentos em aberto a partir de uma conta do tipo "employee"', async () => {
      await request(app.getHttpServer())
        .get(AttendanceRouteUrl)
        .set('Authorization', `Bearer ${employeeLogedIn.access_token}`)
        .expect(200)
        .then((response) => {
          const { message, data } = response.body as HttpResponse;

          expect(message).toBe('Atendimentos retornados com sucesso!');
          expect(data).not.toStrictEqual([
            {
              id: 1,
              Client: {
                name: 'Test 1',
                email: 'test1@test.com',
              },
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
            },
            {
              id: 2,
              Client: {
                name: 'Test 1',
                email: 'test1@test.com',
              },
              AttendanceServices: [
                {
                  Service: {
                    name: 'servico 1',
                    description: 'Descricao do servico 1',
                    estimatedTime: 50,
                    timeMeasure: 'MINUTE',
                  },
                },
                {
                  Service: {
                    name: 'servico 2',
                    description: 'Descricao do servico 2',
                    estimatedTime: 50,
                    timeMeasure: 'MINUTE',
                  },
                },
              ],
            },
          ]);
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
