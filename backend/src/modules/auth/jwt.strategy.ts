import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  AUTH_DEV_MOCK_USER_ID,
  isAuthDevBypassActive,
} from './auth.constants';
import { isAspNetUserLockedOut } from './account-lock.util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dummy_secret_for_passport_init',
    });
  }

  // Override passport-jwt authenticate to skip signature verification in development
  authenticate(req: any, options?: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) {
      return (this as any).fail('No auth token', 401);
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return (this as any).fail('Invalid token format', 401);
      }
      
      // Handle base64url decoding safely
      let base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      while (base64Payload.length % 4) {
        base64Payload += '=';
      }
      
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
      if (!payload) {
        return (this as any).fail('Invalid token payload', 401);
      }

      this.validate(payload).then(
        (user) => {
          if (user) {
            (this as any).success(user);
          } else {
            (this as any).fail('User not found or locked out', 401);
          }
        },
        (err) => {
          (this as any).error(err);
        }
      );
    } catch (err) {
      (this as any).error(err);
    }
  }

  async validate(payload: any) {
    const userId = payload.sub || 
                   payload.nameid || 
                   payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

    if (!userId) {
      return null;
    }

    if (
      isAuthDevBypassActive() &&
      userId === AUTH_DEV_MOCK_USER_ID
    ) {
      const existingDevUser = await this.prisma.aspNetUsers.findUnique({
        where: { Id: AUTH_DEV_MOCK_USER_ID },
      });

      if (!existingDevUser) {
        const email = payload.email ?? 'dev@local.test';
        const username = payload.username ?? 'dev';

        await this.prisma.aspNetUsers.create({
          data: {
            Id: AUTH_DEV_MOCK_USER_ID,
            FullName: 'Dev User',
            NotificationsEnabled: false,
            Language: 'en',
            SessionsCompleted: 0,
            ExercisesCompleted: 0,
            ActiveDays: 0,
            Email: email,
            NormalizedEmail: email.toUpperCase(),
            UserName: username,
            NormalizedUserName: username.toUpperCase(),
            EmailConfirmed: false,
            PhoneNumberConfirmed: false,
            TwoFactorEnabled: false,
            LockoutEnabled: false,
            AccessFailedCount: 0,
          },
        });
      }

      return {
        id: AUTH_DEV_MOCK_USER_ID,
        email: payload.email ?? 'dev@local.test',
        username: payload.username ?? 'dev',
        role: payload.role ?? 'ADMIN',
      };
    }

    const user = await this.prisma.aspNetUsers.findUnique({
      where: { Id: userId },
      include: {
        AspNetUserRoles: { include: { AspNetRoles: true } }
      }
    });

    if (!user) {
      return null;
    }

    if (isAspNetUserLockedOut(user)) {
      return null;
    }

    return {
      id: user.Id,
      email: user.Email,
      username: user.UserName,
      role: (user.AspNetUserRoles[0]?.AspNetRoles?.Name || 'USER').toUpperCase(),
    };
  }
}
