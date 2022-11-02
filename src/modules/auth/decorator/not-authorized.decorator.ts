import { SetMetadata } from '@nestjs/common';

export const NOT_AUTHORIZED = 'notAuthorized';
export enum UserType {
  CLIENT = 'client',
  EMPLOYEE = 'employee',
}

export const NotAuthorized = (userType: UserType) =>
  SetMetadata(NOT_AUTHORIZED, userType);
