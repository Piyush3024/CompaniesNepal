import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const secret = configService.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (request?.cookies?.accessToken as string | undefined) || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { userId: number }) {
    // Fetch user from database
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
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
      throw new UnauthorizedException('User not found');
    }

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
          forceLogout: true,
        });
      }
    }

    return user;
  }
}
