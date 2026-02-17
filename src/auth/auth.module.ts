import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [ConfigModule, JwtModule.register({}), UsersModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, AccessTokenGuard, RolesGuard],
  exports: [AccessTokenGuard, RolesGuard],
})
export class AuthModule {}
