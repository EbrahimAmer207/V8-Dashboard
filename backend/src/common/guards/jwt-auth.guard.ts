import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err) {
      throw err;
    }

    if (!user) {
      const message = typeof info?.message === 'string' ? info.message : 'No token provided';
      if (message.includes('No auth token')) {
        throw new UnauthorizedException('No token provided');
      }
      if (message.includes('jwt expired')) {
        throw new UnauthorizedException('Token expired');
      }
      if (message.includes('invalid') || message.includes('malformed')) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException(message || 'Unauthorized');
    }

    return user;
  }
}
