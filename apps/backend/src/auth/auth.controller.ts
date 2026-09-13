import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; passwordPlain: string }) {
    const user = await this.authService.validateUser(body.email, body.passwordPlain);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    return this.authService.login(user);
  }
}
