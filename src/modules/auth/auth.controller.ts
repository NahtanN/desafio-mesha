import { Body, Controller, Post } from '@nestjs/common';
import { Client, Prisma } from '@prisma/client';
import { HttpResponse } from 'src/utils/http-responses';
import { ClientService } from '../client/client.service';
import { AuthService } from './auth.service';
import { Public } from './decorator';
import { SigninDTO, SignupDTO } from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly clientService: ClientService,
  ) {}

  @Public()
  @Post('signup')
  async signup(@Body() signupDTO: SignupDTO): Promise<HttpResponse> {
    const { email, password, name } = signupDTO;

    // Criptografar senha
    const { hash, salt } = this.authService.genPassword(password);

    await this.clientService.create({
      email,
      name,
      password: `${hash}.${salt}`,
    });

    return HttpResponse.created('Usuário cadastrado com sucesso!');
  }

  @Public()
  @Post('signin')
  async signin(@Body() signinDTO: SigninDTO): Promise<HttpResponse> {
    const { password, email } = signinDTO;

    // Encontra usuário
    const user: Partial<Client> = await this.clientService.find(
      {
        email,
      },
      {
        id: true,
        email: true,
        password: true,
      },
    );

    if (!user) {
      throw HttpResponse.badRequest('Usuário ou senha incorretos!');
    }

    // Verifica senha
    if (!this.authService.validPassword(password, user.password)) {
      throw HttpResponse.badRequest('Usuário ou senha incorretos!');
    }

    // Cria Tokens
    const tokens = await this.authService.getTokens(user.email, user.id);

    return HttpResponse.ok('Logado com sucesso', tokens);
  }
}
