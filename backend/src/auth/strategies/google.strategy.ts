import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  Strategy,
  VerifyCallback,
  StrategyOptionsWithRequest,
  Profile,
} from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { user } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const options: StrategyOptionsWithRequest = {
      clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      callbackURL: `${configService.get<string>('SERVER_URL') || 'http://localhost:5000'}/auth/google/callback`,
      scope: ['email', 'profile'],
      passReqToCallback: true,
    };
    super(options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      const oauthId = profile.id;
      const email = profile?.emails?.[0]?.value || '';
      const username =
        profile?.displayName?.replace(/\s/g, '').toLowerCase() || '';
      const profile_picture =
        (profile?.photos?.[0]?.value as string) || undefined;

      // Check if user already exists
      let user: user | null = await this.prisma.user.findFirst({
        where: {
          OR: [{ oauth_id: oauthId }, { email }],
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
        // Create new user
        user = await this.prisma.user.create({
          data: {
            oauth_id: oauthId,
            oauth_provider: 'google',
            email,
            username: username + '_' + Date.now(),
            profile_picture,
            password: '',
            role_id: 1,
            status_id: 1,
            email_verified: true,
            last_login: new Date(),
            created_at: new Date(),
            updated_at: new Date(),
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
      } else {
        // Update existing user's last login
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            last_login: new Date(),
            oauth_id: oauthId,
            oauth_provider: 'google',
            profile_picture,
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
      }

      done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      done(error, {});
    }
  }
}
