import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SignUpDto, SignInDto, AuthResponseDto, RefreshTokenDto } from './dto';
import {
  AUTH_DEV_MOCK_USER_ID,
  isAuthDevBypassActive,
} from './auth.constants';
import { isAspNetUserLockedOut } from './account-lock.util';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }

  // async signUp(signUpDto: SignUpDto): Promise<AuthResponseDto> {
  //   const { email, username, password, firstName, lastName } = signUpDto;
  //   const existingUser = await this.prisma.aspNetUsers.findFirst({ where: { Email: email } });
  //   if (existingUser) throw new BadRequestException('Email already registered');
  //   // ... rest of sign up logic
  // }

  async signIn(signInDto: SignInDto): Promise<AuthResponseDto> {
    const email = signInDto.email.trim();
    const password = signInDto.password;

    if (isAuthDevBypassActive()) {
      this.logger.warn(
        'AUTH_DEV_BYPASS: issuing mock session without database check (development only)',
      );
      const username = email.includes('@') ? email.split('@')[0]! : email;
      return this.generateAuthResponse({
        id: AUTH_DEV_MOCK_USER_ID,
        email,
        username,
        firstName: 'Dev',
        lastName: 'User',
        role: 'ADMIN',
      });
    }

    const normalizedEmail = email.toUpperCase();

    // Match ASP.NET Identity lookups: Email, NormalizedEmail, or username-style login
    const user = await this.prisma.aspNetUsers.findFirst({
      where: {
        OR: [
          { Email: email },
          { NormalizedEmail: normalizedEmail },
          { UserName: email },
          { NormalizedUserName: normalizedEmail },
        ],
      },
      include: {
        AspNetUserRoles: { include: { AspNetRoles: true } }
      }
    });

    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(
          `Sign-in: no AspNetUsers row matched identifier "${email}"`,
        );
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.PasswordHash) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.warn(
          `Sign-in: user ${user.Id} has no PasswordHash (set password in the main app)`,
        );
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    if (isAspNetUserLockedOut(user)) {
      throw new UnauthorizedException(
        'Account is temporarily locked. Try again later.',
      );
    }

    if (!this.verifyAspNetIdentityPassword(user.PasswordHash, password)) {
      if (process.env.NODE_ENV !== 'production') {
        let formatHint = '';
        try {
          const buf = Buffer.from(user.PasswordHash, 'base64');
          if (buf.length && buf[0] !== 0x00 && buf[0] !== 0x01) {
            formatHint =
              ' — hash is not ASP.NET Identity PBKDF2 v2/v3 (wrong password or different hasher)';
          }
        } catch {
          formatHint = ' — PasswordHash is not valid base64';
        }
        this.logger.warn(
          `Sign-in: password verification failed for user ${user.Id}${formatHint}`,
        );
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.generateAuthResponse({
      id: user.Id,
      email: user.Email,
      username: user.UserName,
      firstName: user.FullName?.split(' ')[0] || 'User',
      lastName: user.FullName?.split(' ').slice(1).join(' ') || '',
      role: user.AspNetUserRoles?.[0]?.AspNetRoles?.Name || 'USER'
    });
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      return decoded;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    this.logger.debug('[AuthService] refreshToken called');

    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      'super-secret-key';

    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      }) as { sub: string };

      this.logger.debug('[AuthService] refresh token verified', { sub: decoded?.sub });

      if (
        isAuthDevBypassActive() &&
        decoded.sub === AUTH_DEV_MOCK_USER_ID
      ) {
        return this.generateAuthResponse({
          id: AUTH_DEV_MOCK_USER_ID,
          email: 'dev@local.test',
          username: 'dev',
          firstName: 'Dev',
          lastName: 'User',
          role: 'ADMIN',
        });
      }

      const user = await this.prisma.aspNetUsers.findUnique({
        where: { Id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      if (isAspNetUserLockedOut(user)) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.generateAuthResponse({
        id: user.Id,
        email: user.Email,
        username: user.UserName,
        firstName: user.FullName?.split(' ')[0] || 'User',
        lastName: user.FullName?.split(' ').slice(1).join(' ') || '',
        role: 'USER',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateAuthResponse(user: any): AuthResponseDto {
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    );

    const refreshSecret =
      process.env.JWT_REFRESH_SECRET ||
      process.env.JWT_SECRET ||
      'super-secret-key';

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: '7d',
        secret: refreshSecret,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  private verifyAspNetIdentityPassword(hash: string, password: string): boolean {
    const decoded = Buffer.from(hash, 'base64');
    if (decoded.length === 0) return false;

    if (decoded[0] === 0x00) {
      return this.verifyIdentityV2(decoded, password);
    }

    if (decoded[0] === 0x01) {
      return this.verifyIdentityV3(decoded, password);
    }

    return false;
  }

  private verifyIdentityV2(decoded: Buffer, password: string): boolean {
    if (decoded.length !== 49) return false;

    const salt = decoded.subarray(1, 17);
    const expected = decoded.subarray(17, 49);
    const actual = crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha1');

    return crypto.timingSafeEqual(actual, expected);
  }

  private verifyIdentityV3(decoded: Buffer, password: string): boolean {
    if (decoded.length < 13) return false;

    const prf = decoded.readUInt32BE(1);
    const iterations = decoded.readUInt32BE(5);
    const saltLength = decoded.readUInt32BE(9);

    if (saltLength < 16 || decoded.length < 13 + saltLength + 16) return false;

    const salt = decoded.subarray(13, 13 + saltLength);
    const expected = decoded.subarray(13 + saltLength);
    const digest = prf === 0 ? 'sha1' : prf === 1 ? 'sha256' : prf === 2 ? 'sha512' : null;
    if (!digest) return false;

    const actual = crypto.pbkdf2Sync(password, salt, iterations, expected.length, digest);
    return crypto.timingSafeEqual(actual, expected);
  }
}
