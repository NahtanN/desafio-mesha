import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Client, Employee, Prisma } from '@prisma/client';
import { HttpResponse } from 'src/utils/http-responses';
import { ClientService } from '../client/client.service';
import { EmployeeService } from '../employee/employee.service';
import { AuthService } from './auth.service';
import { Public } from './decorator';
import { SigninDto, SignupDto } from './dto';
import { TokenAccessType } from './types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientService: ClientService,
    private readonly employeeService: EmployeeService,
  ) {}

  @ApiTags('Auth')
  @ApiBody({
    type: SignupDto,
    description:
      'Caso deseje criar um usuario do tipo "funcionario", adicione a propriedade "type" ao Body da requisição. Caso contrario, pode omitir essa propriedade.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        code: 201,
        message: 'Funcionario cadastrado com sucesso!',
        data: {},
      },
    },
  })
  @Public()
  @Post('signup')
  async signup(@Body() signupDTO: SignupDto): Promise<HttpResponse> {
    const { email, password, name, type } = signupDTO;

    // Criptografar senha
    const { hash, salt } = this.authService.genPassword(password);

    const createData: Prisma.EmployeeCreateInput | Prisma.ClientCreateInput = {
      email,
      name,
      password: `${hash}.${salt}`,
    };

    let responseUserType: string;

    if (type === 'employee') {
      await this.employeeService.create(
        createData as Prisma.EmployeeCreateInput,
      );
      responseUserType = 'Funcionario';
    } else {
      await this.clientService.create(createData as Prisma.ClientCreateInput);
      responseUserType = 'Cliente';
    }

    return HttpResponse.created(`${responseUserType} cadastrado com sucesso!`);
  }

  @ApiTags('Auth')
  @ApiBody({
    type: SigninDto,
    description:
      'Caso deseje logar como um usuario do tipo "funcionario", adicione a propriedade "type" ao Body da requisição. Caso contrario, pode omitir essa propriedade.',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        code: 200,
        message: 'Logado como funcionario com sucesso!',
        data: {
          access_token:
            'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYXNmQGhmZ2QuY29tIiwiYWNjZXNzIjoiY2xpZW50IiwiaWF0IjoxNjY3NDI0MjgwLCJleHAiOjE2Njc0MjQ4ODB9.SbgW-utKWXf01PtDIpgkO7DFkEux-lTdt1kKiUVTa3rFkrBtsLfXabuZNDL5HDuM7BQxLONOy6-ykav9KlHGRtZ4hUYDwrlwjme4H6rY_8gxl2u7GANG3X4eMcIwA8ZYDFx_OmdWQuwdlO7evpTHLosVzBTrL5S2GXFbgRrv7huGJ84PkC18dxjLKndOEv_ZNqn1hKpngQTubMQUKoLp4nTJuNuebM0LqG3aFaWn43MbeXQvfYFy8MRxd8hWNAlnIa58HlZ4Fs905dyo0ZmabtTVrkcjGJeku9GnW7sUkTp7cXpzk5xkro73Fx8IJaTsLBEn8iwmXVh6Gh_V4t5MbA',
        },
      },
    },
  })
  @Public()
  @Post('signin')
  async signin(@Body() signinDTO: SigninDto): Promise<HttpResponse> {
    const { password, email, type } = signinDTO;

    let user: Partial<Client | Employee>;

    const where: Prisma.EmployeeWhereInput | Prisma.ClientWhereInput = {
      email,
    };
    const select: Prisma.EmployeeSelect | Prisma.ClientSelect = {
      id: true,
      email: true,
      password: true,
    };

    let responseUserType: string;
    let userType: TokenAccessType;

    // Encontra usuário
    if (type === 'employee') {
      user = await this.employeeService.find(
        where as Prisma.EmployeeWhereInput,
        select as Prisma.EmployeeSelect,
      );
      responseUserType = 'funcionario';
      userType = TokenAccessType.EMPLOYEE;
    } else {
      user = await this.clientService.find(
        where as Prisma.ClientWhereInput,
        select as Prisma.ClientSelect,
      );
      responseUserType = 'cliente';
      userType = TokenAccessType.CLIENT;
    }

    if (!user) {
      throw HttpResponse.badRequest('Usuário ou senha incorretos!');
    }

    // Verifica senha
    if (!this.authService.validPassword(password, user.password)) {
      throw HttpResponse.badRequest('Usuário ou senha incorretos!');
    }

    // Cria Tokens
    const tokens = await this.authService.getTokens(
      user.email,
      user.id,
      userType,
    );

    return HttpResponse.ok(
      `Logado como ${responseUserType} com sucesso!`,
      tokens,
    );
  }
}
