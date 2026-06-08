import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { CookieOptions, Request, Response } from "express";
import { AccessTokenGuard } from "./guards/access-token.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { CurrentUser } from "./decorators/current-user.decorator";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getCookieValue(req: Request, name: string) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return null;

    const cookie = cookieHeader
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
  }

  private setAuthCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    const cookieOptions = this.getAuthCookieOptions();

    res.cookie("access_token", tokens.access_token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refresh_token", tokens.refresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private getAuthCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };
  }

  private clearAuthCookies(res: Response) {
    const cookieOptions = this.getAuthCookieOptions();

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);
  }

  @ApiOperation({ summary: "Register a new customer account" })
  @Post("register")
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @ApiOperation({ summary: "Login with email and password" })
  @Post("login")
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(res, result);
    return { user: result.user };
  }

  @ApiOperation({ summary: "Refresh access token" })
  @Post("refresh")
  async refresh(
    @Req() req: Request,
    @Body("refresh_token") bodyRefreshToken: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      this.getCookieValue(req, "refresh_token") ?? bodyRefreshToken;
    const tokens = await this.authService.refresh(refreshToken ?? "");
    this.setAuthCookies(res, tokens);
    return { success: true };
  }

  @ApiOperation({ summary: "Logout current session" })
  @Post("logout")
  async logout(@Res({ passthrough: true }) res: Response) {
    this.clearAuthCookies(res);
    return { success: true };
  }

  @ApiOperation({ summary: "Get current user profile" })
  @ApiBearerAuth()
  @Get("profile")
  @UseGuards(AccessTokenGuard)
  async profile(@CurrentUser() user: { sub: number }) {
    return this.authService.profile(user.sub);
  }

  @ApiOperation({ summary: "Update current user profile" })
  @ApiBearerAuth()
  @Patch("profile")
  @UseGuards(AccessTokenGuard)
  async updateProfile(
    @CurrentUser() user: { sub: number },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.sub, dto);
  }
}
