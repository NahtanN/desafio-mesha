import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpResponse } from 'src/utils';
import { PrismaService } from 'src/modules/prisma/prisma.service';

const users = [
  {
    name: 'Usuario Teste',
    email: 'asdf@asdf.com',
    password: '123456',
  },
];

describe('AuthController (e2e)', () => {
  const SignupRouteUrl = '/auth/signup';
  const SigninRouteUrl = '/auth/signin';

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

  describe(`${SignupRouteUrl} (POST)`, () => {
    it('Deve criar um usuario do tipo "client"', () => {
      return request(app.getHttpServer())
        .post(SignupRouteUrl)
        .send(users[0])
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          const { message } = res.body as HttpResponse;

          expect(message).toBe('Cliente cadastrado com sucesso!');
        });
    });

    it('Deve criar um usuario do tipo "employee"', () => {
      return request(app.getHttpServer())
        .post(SignupRouteUrl)
        .send({
          ...users[0],
          type: 'employee',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then((res) => {
          const { message } = res.body as HttpResponse;

          expect(message).toBe('Funcionario cadastrado com sucesso!');
        });
    });

    it('Deve criar um usuario do tipo "cliente" com um email já em uso', async () => {
      const response = await request(app.getHttpServer())
        .post(SignupRouteUrl)
        .send(users[0])
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400);

      const { message, data } = response.body as HttpResponse;

      expect(message).toBe('Email já em uso!');
      expect(data.code).toBe('P2002');
      expect(data.meta.target[0]).toBe('email');
    });
  });

  describe(`${SigninRouteUrl} (POST)`, () => {
    it('Deve logar como "client"', () => {
      return request(app.getHttpServer())
        .post(SigninRouteUrl)
        .send({
          email: users[0].email,
          password: users[0].password,
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then((response) => {
          const { message } = response.body as HttpResponse;

          expect(message).toBe('Logado como cliente com sucesso!');
        });
    });

    it('Deve logar como "employee"', () => {
      return request(app.getHttpServer())
        .post(SigninRouteUrl)
        .send({
          email: users[0].email,
          password: users[0].password,
          type: 'employee',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201)
        .then((response) => {
          const { message } = response.body as HttpResponse;

          expect(message).toBe('Logado como funcionario com sucesso!');
        });
    });

    it('Deve tentar logar como "employee" com a senha errada', () => {
      return request(app.getHttpServer())
        .post(SigninRouteUrl)
        .send({
          email: users[0].email,
          password: 'asdfgsdfg',
          type: 'employee',
        })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400)
        .then((response) => {
          const { message } = response.body as HttpResponse;

          expect(message).toBe('Usuário ou senha incorretos!');
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
