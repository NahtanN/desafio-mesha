import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { pbkdf2Sync, randomBytes } from 'crypto';
import { TokenType } from './types';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   *
   * @param email
   * @param userId
   * @returns access_token
   */
  async getTokens(email: string, clientId: number) {
    const payload: TokenType = {
      sub: clientId,
      email,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: `${process.env.JWT_EXPIRES_IN}s`,
      algorithm: 'RS256',
      secret: process.env.JWT_PRIVATE_KEY,
    });

    return {
      access_token,
    };
  }

  genPassword(password: string) {
    const salt = randomBytes(32).toString('hex');
    const genHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString(
      'hex',
    );

    return {
      salt: salt,
      hash: genHash,
    };
  }

  validPassword(password: string, hashedPassword: string) {
    const [hash, salt] = hashedPassword.split('.');

    const hashVerify = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString(
      'hex',
    );

    return hash === hashVerify;
  }
}
