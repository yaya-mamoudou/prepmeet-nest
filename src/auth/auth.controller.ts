import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import {
  ClientSignupExample,
  ExpertSignupExample,
  LoginExample,
} from './examples/auth';
import { AuthGuard } from '@nestjs/passport';
// import { LocalGuard } from './guards/local.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: RegisterDto,
    examples: {
      ClientSignup: {
        value: ClientSignupExample,
      },
      ExpertSignup: {
        value: ExpertSignupExample,
      },
    },
  })
  registerUser(@Body() user: RegisterDto) {
    return this.authService.registerUser(user);
  }

  @Post('login')
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: LoginDto,
    examples: {
      login: {
        value: LoginExample,
      },
    },
  })
  login(@Body() user: LoginDto) {
    return this.authService.login(user);
  }

  @Get('/alice')
  @UseGuards(AuthGuard('jwt'))
  getAlice(@Request() req: any) {
    const user = req.user;
    console.log('get alice', user);
  }
}
