import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { AppRole } from "../common/types/role.type";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getAccessSecret() {
    return (
      this.configService.get<string>("JWT_ACCESS_SECRET") ??
      "access_secret_change_me"
    );
  }

  private getRefreshSecret() {
    return (
      this.configService.get<string>("JWT_REFRESH_SECRET") ??
      "refresh_secret_change_me"
    );
  }

  private getAccessExpiresIn() {
    return this.configService.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m";
  }

  private getRefreshExpiresIn() {
    return this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") ?? "7d";
  }

  private async signTokens(userId: number, email: string, role: AppRole) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getAccessSecret(),
        expiresIn: this.getAccessExpiresIn(),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.getRefreshSecret(),
        expiresIn: this.getRefreshExpiresIn(),
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      username: dto.username,
      email: dto.email,
      password: dto.password,
      avatar: dto.avatar,
      role: "customer",
    });

    const raw = await this.usersService.findByIdRaw(user.id);
    const tokens = await this.signTokens(
      raw.id,
      raw.email,
      raw.role as AppRole,
    );
    await this.usersService.setRefreshToken(raw.id, tokens.refresh_token);

    return {
      ...tokens,
      user: this.usersService.sanitize(raw),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);

    if (!validPassword) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const tokens = await this.signTokens(
      user.id,
      user.email,
      user.role as AppRole,
    );
    await this.usersService.setRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: this.usersService.sanitize(user),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        role: AppRole;
      }>(refreshToken, {
        secret: this.getRefreshSecret(),
      });

      const valid = await this.usersService.validateRefreshToken(
        payload.sub,
        refreshToken,
      );

      if (!valid) {
        throw new ForbiddenException("Invalid refresh token");
      }

      const tokens = await this.signTokens(
        payload.sub,
        payload.email,
        payload.role,
      );
      await this.usersService.setRefreshToken(
        payload.sub,
        tokens.refresh_token,
      );

      return tokens;
    } catch (_error) {
      throw new ForbiddenException("Invalid refresh token");
    }
  }

  async profile(userId: number) {
    const user = await this.usersService.findByIdRaw(userId);
    return this.usersService.sanitize(user);
  }
}
