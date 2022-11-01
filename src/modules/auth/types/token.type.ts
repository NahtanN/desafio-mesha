export type TokenType = {
  sub: number;
  email: string;
  access: TokenAccessType;
};

export enum TokenAccessType {
  EMPLOYEE = 'employee',
  CLIENT = 'client',
}
