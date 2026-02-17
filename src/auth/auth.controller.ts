import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from './guards/access-token.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refresh_token);
  }

  @Get('profile')
  @UseGuards(AccessTokenGuard)
  async profile(@CurrentUser() user: { sub: number }) {
    return this.authService.profile(user.sub);
  }
}
