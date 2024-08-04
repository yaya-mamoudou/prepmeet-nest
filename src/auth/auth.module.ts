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
import { ExpertProfile } from 'src/expert-profile/entities/expert-profile.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      User,
      VerificationCode,
      VerificationEmail,
      ExpertProfile,
    ]),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
