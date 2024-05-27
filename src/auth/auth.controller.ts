import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/auth.entity';
import { ClientSignupExample, ExpertSignupExample } from './examples/auth';

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
}
