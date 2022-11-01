import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { EmployeeService } from 'src/modules/employee/employee.service';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { HttpResponse } from 'src/utils/http-responses';
import { EMPLOYEE, IS_PUBLIC } from '../decorator';

@Injectable()
export class AccessControlGuard extends AuthGuard('jwt') {
  constructor(
    private reflactor: Reflector,
    private prismaService: PrismaService,
    private employeeService: EmployeeService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isEmployee = this.reflactor.getAllAndOverride<boolean>(EMPLOYEE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isEmployee) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (user.access !== 'employee') {
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
