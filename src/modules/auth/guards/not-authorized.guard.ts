import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { HttpResponse } from 'src/utils/http-responses';
import { NOT_AUTHORIZED, UserType } from '../decorator';

@Injectable()
export class NotAuthorizedGuard extends AuthGuard('jwt') {
  constructor(private reflactor: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const notAuthorized = this.reflactor.getAllAndOverride<UserType>(
      NOT_AUTHORIZED,
      [context.getHandler(), context.getClass()],
    );

    if (!notAuthorized) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (user.access === notAuthorized) {
      throw HttpResponse.forbidden('Acesso não autorizado!');
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any): TUser {
    if (err || !user) {
      throw HttpResponse.unauthorized();
    }

    return user;
  }
}
