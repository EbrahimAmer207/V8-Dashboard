import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, RefreshTokenDto, AuthResponseDto } from './dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // @Post('signup')
  // async signUp(@Body() signUpDto: SignUpDto): Promise<AuthResponseDto> {
  //   return this.authService.signUp(signUpDto);
  // }

  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signIn(signInDto);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    this.logger.debug('[AuthController] refreshToken called');
    try {
      const result = await this.authService.refreshToken(refreshTokenDto);
      this.logger.debug('[AuthController] refreshToken succeeded');
      return result;
    } catch (err) {
      this.logger.warn('[AuthController] refreshToken failed', err?.stack || err?.message || err);
      throw err;
    }
  }
}
