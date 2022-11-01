import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthService } from '../../auth.service';
import { TokenAccessType } from '../../types';

const clientData = {
  email: 'test@test.com',
  id: 123,
  access: TokenAccessType.CLIENT,
};

const employeeData = {
  email: 'employee@employee.com',
  id: 345,
  access: TokenAccessType.EMPLOYEE,
};

describe('Teste de integração do Auth Service', () => {
  let prisma: PrismaService;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = moduleRef.get(PrismaService);
    authService = moduleRef.get(AuthService);
    jwtService = moduleRef.get(JwtService);

    await prisma.cleanDatabase();
  });

  describe('genTokens()', () => {
    it('Deve criar um token onde o atributo "access" do payload seja "client"', async () => {
      const { access_token } = await authService.getTokens(
        clientData.email,
        clientData.id,
        clientData.access,
      );

      const jwt = jwtService.verify(access_token, {
        secret: process.env.JWT_PUBLIC_KEY,
      });

      expect(jwt).toBeDefined();
      expect(jwt.sub).toBe(clientData.id);
      expect(jwt.email).toBe(clientData.email);
      expect(jwt.access).toBe('client');
    });

    it('Deve criar um token onde o atributo "access" do payload seja "client"', async () => {
      const { access_token } = await authService.getTokens(
        employeeData.email,
        employeeData.id,
        employeeData.access,
      );

      const jwt = jwtService.verify(access_token, {
        secret: process.env.JWT_PUBLIC_KEY,
      });

      expect(jwt).toBeDefined();
      expect(jwt.sub).toBe(employeeData.id);
      expect(jwt.email).toBe(employeeData.email);
      expect(jwt.access).toBe('employee');
    });
  });

  describe('genPassword()', () => {
    it('Deve criar um Hash e um salt', () => {
      const { hash, salt } = authService.genPassword('1234assdf');

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');

      expect(salt).toBeDefined();
      expect(typeof salt).toBe('string');
    });
  });

  describe('validPassword()', () => {
    const password = 'askdgjha23154';
    let hashedPassword: string;

    it('Deve criar uma senha', () => {
      const { hash, salt } = authService.genPassword(password);

      hashedPassword = `${hash}.${salt}`;
    });
    it('Deve verificar se uma senha em plain text e um hash  são válidos', () => {
      const isValid = authService.validPassword(password, hashedPassword);

      expect(typeof isValid).toBe('boolean');
      expect(isValid).toBe(true);
    });
  });
});
