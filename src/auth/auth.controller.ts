import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './dto/registerUser.dto';
import { LoginDto } from './dto/login.dto'
import { AuthService } from './auth.service';
@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) { }

  @Post("register")
  async register(@Body() registerUserDto: RegisterDto) {
    let user = await this.authService.register(registerUserDto);

    return user;
  }

  @Post("/login")
  async login(@Body() loginDto: LoginDto) {

    let token = await this.authService.login(loginDto);
    return token
  }
}
