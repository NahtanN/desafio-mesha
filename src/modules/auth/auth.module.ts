import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ClientModule } from '../client/client.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({}), ClientModule],
  controllers: [AuthController],
  providers: [AtStrategy, AuthService],
})
export class AuthModule {}
