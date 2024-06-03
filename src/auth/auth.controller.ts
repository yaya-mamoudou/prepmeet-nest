import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Redirect,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthResetPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  SocialLoginDto,
  SocialRegistrationDto,
} from './dto/auth.dto';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  AuthPasswordResetExample,
  ClientSignupExample,
  ExpertSignupExample,
  LoginExample,
  PasswordResetExample,
  SocialLoginExample,
  SocialSignupExample,
} from './examples/auth';
import { AuthGuard } from '@nestjs/passport';
import { SocialAuthenticationParam } from 'src/utils/enum';

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

  @Post('social-registration/:type')
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: SocialRegistrationDto,
    examples: {
      signup: {
        value: SocialSignupExample,
      },
    },
  })
  socialRegistration(
    @Body() body: SocialRegistrationDto,
    @Param() data: { type: SocialAuthenticationParam },
  ) {
    if (data.type === SocialAuthenticationParam.google) {
      return this.authService.googleSignup(body);
    }
    return this.authService.facebookSignup();
  }

  @Post('social-login/:type')
  @UsePipes(ValidationPipe)
  @ApiBody({
    type: SocialLoginDto,
    examples: {
      signup: {
        value: SocialLoginExample,
      },
    },
  })
  socialLogin(
    @Body() body: SocialLoginDto,
    @Param() data: { type: SocialAuthenticationParam },
  ) {
    if (data.type === SocialAuthenticationParam.google) {
      return this.authService.googleLogin(body);
    }
    return this.authService.facebookSignup();
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

  @Get('/forgot-password/:email')
  @ApiOperation({ summary: 'Request otp to reset password' })
  forgetPasswordRequestOtp(@Param() data: { email: string }) {
    return this.authService.forgetPasswordRequestOtp(data);
  }

  @Post('/verify-forgot-password-otp/:email')
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Verify otp code and Reset password' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      login: {
        value: PasswordResetExample,
      },
    },
  })
  verifyAndResetForgetPasswordOtp(
    @Param() { email }: { email: string },
    @Body() body: ResetPasswordDto,
  ) {
    return this.authService.verifyForgetPasswordOtp(
      email,
      body.code,
      body.newPassword,
    );
  }

  @Get('/request-email-verification/:email')
  @ApiOperation({ summary: 'Send Verification email to users email address' })
  verifyUserEmail(@Param() data: { email: string }) {
    return this.authService.requestVerifyUserEmail(data.email);
  }

  @Get('/verify-email/:user')
  @Redirect('https://queueslot-web.vercel.app/', 200)
  @ApiOperation({ summary: 'Verify users email' })
  verifyEmail(@Param() data: { user: string }) {
    return this.authService.emailVerification(data.user);
  }

  @Post('/reset-password')
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(ValidationPipe)
  @ApiOperation({ summary: 'Allow logged in user change their password' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      login: {
        value: AuthPasswordResetExample,
      },
    },
  })
  resetPassword(@Request() req: any, @Body() body: AuthResetPasswordDto) {
    const user = req.user;
    return this.authService.resetPassword(user.uid, body.newPassword);
  }
}
