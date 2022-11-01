import { SetMetadata } from '@nestjs/common';

export const EMPLOYEE = 'isEmployee';

export const Employee = () => SetMetadata(EMPLOYEE, true);
