import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AtStrategy, RtStrategy } from './stategies';
import { VerificationCode } from './entities/verification-code';
import { VerificationEmail } from './entities/verification-email';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, VerificationCode, VerificationEmail]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {}
