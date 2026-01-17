import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verfication.dto';
import { encodeId, decodeId } from '../common/utils/secure.util';
import { Response } from 'express';
import { isNodeError } from '../common/utils/error.util';
import { UserResponse } from './entities/auth.entity';
import { user } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redis: RedisService,
    private emailService: EmailService,
  ) { }

  private generateTokens(userId: number) {
    const accessToken = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  private generateVerificationToken(userId: number): string {
    return this.jwtService.sign(
      { userId },
      {
        secret: this.configService.get<string>('EMAIL_VERIFICATION_SECRET'),
        expiresIn: '15m',
      },
    );
  }

  private async storeRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const ttl = 7 * 24 * 60 * 60; // 7 days in seconds
    await this.redis.set(`refresh_token:${userId}`, refreshToken, 'EX', ttl);
  }

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  async register(registerDto: RegisterDto, res: Response) {
    const { username, email, password, phone, role_id } = registerDto;
    const roleId = decodeId(role_id);

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone,
        role_id: roleId,
        email_verified: false,
        updated_at: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role_id: true,
        email_verified: true,
        status_id: true,
        created_at: true,
      },
    });


    // Generate verification token
    const verificationToken = this.generateVerificationToken(user.id);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { email_verification_token: verificationToken },
    });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        email,
        verificationToken,
        username,
      );
    } catch (emailError) {
      this.logger.error('Failed to send verification email:', emailError);
      throw new InternalServerErrorException(
        'User created, but failed to send verification email. Please try resending.',
      );
    }

    // Send welcome email (non-critical)
    try {
      await this.emailService.sendWelcomeEmail(email, username);
    } catch (emailError) {
      this.logger.error('Failed to send welcome email:', emailError);
    }

    return {
      success: true,
      message:
        'Registration successful. Please check your email to verify your account.',
      data: { ...user, id: encodeId(user.id), role_id: encodeId(user.role_id), status_id: encodeId(user.status_id) }
    };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, username, password } = loginDto;

    const loginIdentifier = email || username;
    if (!loginIdentifier) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find user by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: loginIdentifier }, { username: loginIdentifier }],
      },
      include: {
        role: {
          select: {
            role_id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if blocked
    if (user.is_blocked) {
      if (user.blocked_until && new Date() > user.blocked_until) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            is_blocked: false,
            blocked_until: null,
          },
        });
      } else {
        throw new UnauthorizedException({
          message: 'Your account is temporarily blocked',
          blocked_until: user.blocked_until,
        });
      }
    }

    // Check email verification
    if (!user.email_verified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user.id);
    await this.storeRefreshToken(user.id, refreshToken);
    this.setCookies(res, accessToken, refreshToken);

    return {
      success: true,
      message: 'Login successful',
      data: {
        id: encodeId(user.id),
        email: user.email,
        profile_picture: user.profile_picture,
        email_verified: user.email_verified,
        username: user.username,
        role: {
          ...user.role,
          role_id: encodeId(user.role.role_id),
        },
      },
    };
  }

  async logout(userId: number, res: Response) {
    try {
      // Remove refresh token from Redis
      await this.redis.del(`refresh_token:${userId}`);

      // Clear cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
      });

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: this.configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
      });

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      this.logger.error('Logout error:', error);
      throw new InternalServerErrorException('Error occurred during logout');
    }
  }

  async verifyEmail(token: string) {
    try {
      const decoded: { userId: number } = this.jwtService.verify(token, {
        secret: this.configService.get<string>('EMAIL_VERIFICATION_SECRET'),
      });

      const user = await this.prisma.user.findFirst({
        where: {
          id: decoded.userId,
          email_verification_token: token,
        },
      });

      if (!user) {
        // Check if already verified
        const existingUser = await this.prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (existingUser && existingUser.email_verified) {
          return {
            success: true,
            message: 'Email already verified!',
            redirectTo: '/login',
          };
        }

        throw new BadRequestException('Invalid or expired verification token');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          email_verified: true,
          email_verification_token: null,
        },
      });

      return {
        success: true,
        message: 'Email verified successfully!',
        redirectTo: '/login',
      };
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'TokenExpiredError') {
        throw new BadRequestException(
          'Verification token has expired. Please request a new one.',
        );
      }
      throw new BadRequestException('Invalid verification token');
    }
  }

  async resendVerification(resendDto: ResendVerificationDto) {
    const { email } = resendDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email is already verified');
    }

    const verificationToken = this.generateVerificationToken(user.id);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { email_verification_token: verificationToken },
    });

    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.username,
      );
    } catch (emailError) {
      this.logger.error('Failed to resend verification email:', emailError);
      throw new InternalServerErrorException(
        'Failed to resend verification email',
      );
    }

    return {
      success: true,
      message: 'Verification email sent successfully',
    };
  }

  async refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not provided');
    }

    try {
      const decoded: { userId: number } = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });

      // Check if refresh token exists in Redis
      const storedRefreshToken = await this.redis.get(
        `refresh_token:${decoded.userId}`,
      );

      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
        },
      });

      if (!user) {
        await this.redis.del(`refresh_token:${decoded.userId}`);
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user.id);
      await this.storeRefreshToken(user.id, tokens.refreshToken);
      this.setCookies(res, tokens.accessToken, tokens.refreshToken);

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { last_login: new Date() },
      });

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          id: encodeId(user.id),
          email: user.email,
          username: user.username,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(forgotDto: ForgotPasswordDto) {
    const { email } = forgotDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate reset token (15 minutes expiry)
    const resetToken = this.jwtService.sign(
      { userId: user.id, email: user.email },
      {
        secret: this.configService.get<string>('PASSWORD_RESET_SECRET'),
        expiresIn: '15m',
      },
    );

    // Store reset token in database
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password_reset_token: resetToken,
        password_reset_expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username,
      );
    } catch (emailError) {
      this.logger.error('Failed to send password reset email:', emailError);
      throw new InternalServerErrorException(
        'Failed to send password reset email',
      );
    }

    return {
      success: true,
      message: 'Password reset link sent to your email',
    };
  }

  async resetPassword(token: string, resetDto: ResetPasswordDto) {
    const { password } = resetDto;

    try {
      // Verify reset token
      const decoded: { userId: number } = this.jwtService.verify(token, {
        secret: this.configService.get<string>('PASSWORD_RESET_SECRET'),
      });

      // Find user with valid reset token
      const user = await this.prisma.user.findFirst({
        where: {
          id: decoded.userId,
          password_reset_token: token,
          password_reset_expires: {
            gt: new Date(), // Token should not be expired
          },
        },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Check if new password is same as existing password
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'Please use a different password. You cannot use your previous password.',
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          password_reset_token: null,
          password_reset_expires: null,
          updated_at: new Date(),
        },
      });

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'TokenExpiredError') {
        throw new BadRequestException(
          'Reset token has expired. Please request a new one.',
        );
      }

      throw new BadRequestException('Invalid reset token');
    }
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        email_verified: true,
        is_blocked: true,
        created_at: true,
        updated_at: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.is_blocked) {
      throw new UnauthorizedException('User is blocked');
    }

    return {
      success: true,
      data: user,
    };
  }
}
