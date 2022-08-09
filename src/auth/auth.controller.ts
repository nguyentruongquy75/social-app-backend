import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GetUser } from './decorator/get-user.decorator';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  signIn(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;

    return this.authService.signIn(email, password);
  }

  @Post('signup')
  signUp(@Body() signUpDto: RegisterDto) {
    return this.authService.signUp(signUpDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@GetUser() user) {
    return user;
  }
}
