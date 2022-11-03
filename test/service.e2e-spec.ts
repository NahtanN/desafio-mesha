import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { HttpResponse } from 'src/utils';
import * as request from 'supertest';
import { servicesData, users } from './mock-data';

describe('ServiceController (e2e)', () => {
  const SignupRouteUrl = '/auth/signup';
  const SigninRouteUrl = '/auth/signin';
  const ServiceRouteUrl = '/service';

  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);

    await app.init();
  });

  describe(`${ServiceRouteUrl} (POST)`, () => {
    it('Deve tentar criar um serviço a partir de uma conta do tipo "client", porem sem exito', async () => {
      await request(app.getHttpServer())
        .post(SignupRouteUrl)
        .send(users[0])
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          const { message } = res.body as HttpResponse;

          expect(message).toBe('Cliente cadastrado com sucesso!');
        });

      const clientLogedIn = await request(app.getHttpServer())
        .post(SigninRouteUrl)
        .send({
          email: users[0].email,
          password: users[0].password,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

      const { data } = clientLogedIn.body as HttpResponse;

      return request(app.getHttpServer())
        .post(ServiceRouteUrl)
        .send(servicesData[0])
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${data.access_token}`)
        .expect('Content-Type', /json/)
        .expect(403)
        .then((res) => {
          const { message } = res.body as HttpResponse;

          expect(message).toBe('Acesso não autorizado!');
        });
    });

    it('Deve criar um serviço a partir de uma conta do tipo "employee"', async () => {
      await request(app.getHttpServer())
        .post(SignupRouteUrl)
        .send({
          ...users[1],
          type: 'employee',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          const { message } = res.body as HttpResponse;

          expect(message).toBe('Funcionario cadastrado com sucesso!');
        });

      const employeeLogedIn = await request(app.getHttpServer())
        .post(SigninRouteUrl)
        .send({
          email: users[1].email,
          password: users[1].password,
          type: 'employee',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

      const { data } = employeeLogedIn.body as HttpResponse;

      return request(app.getHttpServer())
        .post(ServiceRouteUrl)
        .send(servicesData[0])
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${data.access_token}`)
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          const { message } = res.body as HttpResponse;

          expect(message).toBe('Servico criado!');
        });
    });
  });

  describe(`${ServiceRouteUrl} (GET)`, () => {
    it('Deve retornar os serviços disponiveis a partir de uma conta "client"', async () => {
      const clientLogedIn = await request(app.getHttpServer())
        .post(SigninRouteUrl)
        .send({
          email: users[0].email,
          password: users[0].password,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

      const { data } = clientLogedIn.body as HttpResponse;

      return request(app.getHttpServer())
        .get(ServiceRouteUrl)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${data.access_token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          const { message, data } = res.body as HttpResponse;

          expect(message).toBe('Serviços retornado com sucesso!');
          expect(data).toStrictEqual([
            {
              name: 'servico 1',
              description: 'Descricao do servico 1',
              estimatedTime: 50,
              timeMeasure: 'MINUTE',
              value: 12376,
            },
            {
              name: 'servico 2',
              description: 'Descricao do servico 2',
              estimatedTime: 50,
              timeMeasure: 'MINUTE',
              value: 12376,
            },
            {
              name: 'servico 3',
              description: 'Descricao do servico 3',
              estimatedTime: 50,
              timeMeasure: 'MINUTE',
              value: 12376,
            },
          ]);
        });
    });

    it('Deve retornar os serviços disponiveis a partir de uma conta "employee"', async () => {
      const employeeLogedIn = await request(app.getHttpServer())
        .post(SigninRouteUrl)
        .send({
          email: users[1].email,
          password: users[1].password,
          type: 'employee',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);

      const { data } = employeeLogedIn.body as HttpResponse;

      return request(app.getHttpServer())
        .get(ServiceRouteUrl)
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${data.access_token}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .then((res) => {
          const { message, data } = res.body as HttpResponse;

          expect(message).toBe('Serviços retornado com sucesso!');
          expect(data).toStrictEqual([
            {
              name: 'servico 1',
              description: 'Descricao do servico 1',
              estimatedTime: 50,
              timeMeasure: 'MINUTE',
              value: 12376,
            },
            {
              name: 'servico 2',
              description: 'Descricao do servico 2',
              estimatedTime: 50,
              timeMeasure: 'MINUTE',
              value: 12376,
            },
            {
              name: 'servico 3',
              description: 'Descricao do servico 3',
              estimatedTime: 50,
              timeMeasure: 'MINUTE',
              value: 12376,
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
