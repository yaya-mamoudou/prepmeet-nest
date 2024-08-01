import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/auth.entity';
import {
  LoginDto,
  RegisterDto,
  SocialLoginDto,
  SocialRegistrationDto,
} from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateOtp, hashText } from 'src/utils/util';
import {
  SocialAuthenticationParam,
  UserRole,
  VerificationCodeType,
} from 'src/utils/enum';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { VerificationCode } from './entities/verification-code';
import * as moment from 'moment';
import { VerificationEmail } from './entities/verification-email';
import axios from 'axios';

export interface JWTTokens {
  accessToken: string;
  refeshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailerService,
    @InjectRepository(VerificationCode)
    private verificationCodeRepo: Repository<VerificationCode>,
    @InjectRepository(VerificationEmail)
    private verificationEmailRepo: Repository<VerificationEmail>,
  ) { }

  async registerUser(user: RegisterDto) {
    const userDetails = await this.userRepo.findOneBy({ email: user.email });
    if (userDetails) {
      throw new HttpException(
        `Email address already in use, please try again with another email`,
        HttpStatus.CONFLICT,
      );
    }

    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!pattern.test(user.password)) {
      throw new HttpException(
        `Password much contain at least 1 uppercase, 1 lower case and one number`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!user.hasAcceptedTerms) {
      throw new HttpException(
        `Please accept the terms and conditions before proceeding`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (user.role === UserRole.expert) {
      if (!user.phoneNumber) {
        throw new HttpException(
          `Phone number is required`,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const data = {
      ...user,
      createdDate: new Date(),
      updatedDate: new Date(),
      password: hashText(user.password),
    };

    const newUser = await this.userRepo.create({
      ...user,
      createdDate: new Date(),
      updatedDate: new Date(),
      password: hashText(user.password),
    });

    const tokens = await this.getToken(newUser);
    // await this.updateRTHash(newUser.id, tokens.refeshToken);
    await this.userRepo.save(data);
    return { ...tokens, user: newUser };
  }

  async googleSignup(body: SocialRegistrationDto) {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${body.accessToken}`,
    );

    const user = res.data;
    const userDetails = await this.userRepo.findOneBy({
      email: user.email,
    });

    if (userDetails) {
      throw new HttpException(
        `Email address already in use, please try again with another email`,
        HttpStatus.CONFLICT,
      );
    }

    const newUser = await this.userRepo.create({
      ...body,
      createdDate: new Date(),
      updatedDate: new Date(),
      firstName: user.given_name,
      lastName: user.family_name,
      email: user.email,
      profilePhoto: user.picture,
      emailVerified: user.verified_email,
      role: body.role,
    });
    const tokens = await this.getToken(newUser);
    await this.userRepo.save(newUser);
    return tokens;
  }

  async googleLogin(body: SocialLoginDto) {
    const res = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${body.accessToken}`,
    );

    const user = res.data;
    const userDetails = await this.userRepo.findOneBy({
      email: user.email,
    });

    if (!userDetails) {
      throw new HttpException(
        `Invalid login credentials, ensure you are sending the right email and password and try again`,
        HttpStatus.CONFLICT,
      );
    }

    const tokens = await this.getToken(userDetails);
    return tokens;
  }

  async facebookSignup() { }

  async login(user: LoginDto) {
    const userDetails = await this.userRepo.findOneBy({ email: user.email });
    const passwordValidation = hashText(user.password);

    if (!userDetails || passwordValidation !== userDetails.password) {
      throw new HttpException(
        `Invalid login credentials, ensure you are sending the right email and password and try again`,
        HttpStatus.CONFLICT,
      );
    }

    const tokens = await this.getToken(userDetails);

    return { ...tokens, user: userDetails };
  }

  async getToken(user: User): Promise<JWTTokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          uid: user.id,
          email: user.email,
          role: user.role,
        },
        {
          expiresIn: 60 * 60 * 24 * 7,
          secret: 'at-secret',
        },
      ),
      this.jwtService.signAsync(
        {
          uid: user.id,
          email: user.email,
          role: user.role,
        },
        {
          expiresIn: 60 * 60 * 24 * 7,
          secret: 'rt-secret',
        },
      ),
    ]);

    return {
      accessToken: at,
      refeshToken: rt,
    };
  }

  async updateRTHash(userId: number, refreshToken: string) {
    const hash = hashText(refreshToken);

    await this.userRepo.update(userId, {
      hasedRefreshToken: 'alice',
    });
  }

  async getUserByEmail({ email }) {
    return await this.userRepo.findOneBy({
      email: email,
    });
  }

  async getUserById(id) {
    return await this.userRepo.findOneBy({
      id: id,
    });
  }

  async getLoggedInUser(user: User) {
    return await this.userRepo.findOneBy({
      id: user.id,
    });
  }

  getOtpCodeEntry(email) {
    return this.verificationCodeRepo.findOneBy({
      email: email,
    });
  }

  async forgetPasswordRequestOtp({ email }: { email: string }) {
    try {
      const user = await this.getUserByEmail({ email });
      if (!user) {
        throw new HttpException(
          `Email not found in the system`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      let data;
      const otp = generateOtp();

      const codeEntry = await this.getOtpCodeEntry(email);
      if (!codeEntry) {
        data = await this.verificationCodeRepo.save({
          code: otp,
          type: VerificationCodeType.forgotPassword,
          email: email,
          createdDate: new Date(),
        });
      } else {
        data = {
          ...codeEntry,
          code: otp,
          createdDate: new Date(),
        };
        data = this.verificationCodeRepo.update(codeEntry.id, data);
      }

      try {
        await this.mailService.sendMail({
          from: 'alicendeh16@gmail.com',
          to: 'alicendeh@icloud.com',
          subject: `Password reset`,
          text: `Your verification code is ${otp}`,
        });
      } catch (error) {
        throw new HttpException(
          `Error associated with mailing server`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return `code sent to ${email}`;
    } catch (error) {
      throw new HttpException(
        `Internal server`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyForgetPasswordOtp(
    email: string,
    code: number,
    newPassword: string,
  ) {
    const expirationTimeInMinutes = 10;

    const codeEntry = await this.getOtpCodeEntry(email);
    if (!codeEntry) {
      throw new HttpException(
        `No verification code associated with this email`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (codeEntry.verified) {
      throw new HttpException(
        `Verification code already used`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const timeDifference = moment(new Date()).diff(codeEntry.createdDate, 'm');
    if (timeDifference > expirationTimeInMinutes || codeEntry.code !== code) {
      throw new HttpException(
        `Wrong or expired verification code. Please request for a new code and try again!`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.getUserByEmail({ email });
    const hashNewPassword = hashText(newPassword);
    await this.verificationCodeRepo.update(codeEntry.id, {
      verified: true,
      type: VerificationCodeType.forgotPassword,
    });
    return await this.userRepo.update(user.id, {
      password: hashNewPassword,
    });
  }

  async requestVerifyUserEmail(email: string) {
    try {
      const user = await this.getUserByEmail({ email });
      if (!user) {
        throw new HttpException(
          `Email not found in the system`,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const url = `http://localhost:4000/auth/verify-email/${user.email}`;

      await this.verificationEmailRepo.save({
        url,
        type: VerificationCodeType.emailVerification,
        email,
        createdDate: new Date(),
      });
      try {
        await this.mailService.sendMail({
          from: 'alicendeh16@gmail.com',
          to: 'alicendeh@icloud.com',
          subject: `Verify email`,
          html: `<p>Click on the link below to verify your email. If you did not request for this, please ignore this message <a href=${url}>Click here to verify !</a></p>`,
        });
      } catch (error) {
        throw new HttpException(
          `Error associated with mailing server`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return `Email sent to ${user.email}`;
    } catch (error) {
      throw new HttpException(
        `Internal server`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async emailVerification(email: string) {
    const emailEntry = await this.verificationEmailRepo.findOneBy({
      email: email,
    });

    if (emailEntry.verified) {
      throw new HttpException(
        `Verification code already used`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.verificationEmailRepo.update(emailEntry.id, {
      verified: true,
    });
  }

  async resetPassword(id: number, password: string) {
    return await this.userRepo.update(id, { password: hashText(password) });
  }

  async getAllUserByRole(role: UserRole) {
    return await this.userRepo.find({
      where: {
        role: role
      }
    })
  }
}
