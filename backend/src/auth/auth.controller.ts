import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verfication.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';
import type { user } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(registerDto, res);
    return res.status(HttpStatus.CREATED).json(result);
  }

  @Post('/login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 requests per 15 minutes
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto, res);
    return res.json(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken as string;

    if (refreshToken) {
      try {
        // Extract userId from token if available
        const user = req['user'];
        if (user && (user as { id: number }).id) {
          await this.authService.logout((user as { id: number }).id, res);
        }
      } catch (error) {
        Logger.log('Internal Server Error: ', error);
        // Continue with logout even if token is invalid
      }
    }

    // Clear cookies regardless
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() resendDto: ResendVerificationDto) {
    return this.authService.resendVerification(resendDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken as string;
    const result = await this.authService.refreshToken(refreshToken, res);
    return res.json(result);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotDto);
  }

  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('token') token: string,
    @Body() resetDto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(token, resetDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: user) {
    return this.authService.getProfile((user as { id: number }).id);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(@CurrentUser() user: user, @Res() res: Response) {
    try {
      // Generate tokens for OAuth user
      const tokens = this.authService['generateTokens'](user.id);
      await this.authService['storeRefreshToken'](user.id, tokens.refreshToken);

      // Set cookies
      this.authService['setCookies'](
        res,
        tokens.accessToken,
        tokens.refreshToken,
      );

      // Determine if new user
      const isNewUser =
        !user.last_login ||
        new Date(user.last_login).getTime() === new Date().getTime();

      // Redirect to frontend
      const redirectUrl = isNewUser
        ? `${this.configService.get<string>('CLIENT_URL')}/onboarding?isNewUser=true`
        : `${this.configService.get<string>('CLIENT_URL')}/dashboard`;

      return res.redirect(redirectUrl);
    } catch (error) {
      Logger.log('Internal Server Error: ', error);
      const clientUrl = this.configService.get<string>('CLIENT_URL');
      return res.redirect(`${clientUrl}/login?error=auth_failed`);
    }
  }
}
