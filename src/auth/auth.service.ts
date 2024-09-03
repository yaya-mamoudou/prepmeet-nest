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
import { UserRole, VerificationCodeType } from 'src/utils/enum';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { VerificationCode } from './entities/verification-code';
import * as moment from 'moment';
import { VerificationEmail } from './entities/verification-email';
import axios from 'axios';
import { JwtContent } from 'src/utils/types';
import { ExpertProfile } from 'src/expert-profile/entities/expert-profile.entity';
import { UpdateProfileDto } from 'src/expert-profile/dto/update-profile.dto';
import { UserFocusArea } from 'src/expert-profile/entities/user-focus-area.entity';

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
    @InjectRepository(ExpertProfile)
    private expertProfileRepo: Repository<ExpertProfile>,
    @InjectRepository(UserFocusArea)
    private userFocusAreaRepo: Repository<UserFocusArea>,
  ) {}

  async registerUser(user: RegisterDto) {
    const userDetails = await this.userRepo.findOneBy({ email: user.email });

    if (userDetails) {
      throw new HttpException(
        `Email address already in use, please try again with another email`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!pattern.test(user.password)) {
      throw new HttpException(
        `Password must contain at least 1 uppercase, 1 lower case and one number`,
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
      if (
        !user.phoneNumber ||
        user.focusAreaIds?.length === 0 ||
        !user.doesUserHasCloudOrDevopsCertification
      ) {
        throw new HttpException(
          `One or more fields are missing, Phone number, Focus Area or Cloud certification`,
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

    let newUser = await this.userRepo.save(data);
    const tokens = await this.getToken(newUser);

    if (user.role === UserRole.expert) {
      let expert = await this.expertProfileRepo.save({
        userId: newUser.id,
        doesUserHasCloudOrDevopsCertification:
          user.doesUserHasCloudOrDevopsCertification,
        createdDate: new Date(),
        updatedDate: new Date(),
      });

      for (let i = 0; i < user.focusAreaIds.length; i++) {
        await this.userFocusAreaRepo.save({
          userId: newUser.id,
          focusAreaId: user.focusAreaIds[i],
        });
      }
      newUser = { ...newUser, ...expert };
    }

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
        HttpStatus.UNAUTHORIZED,
      );
    }

    let newUser = await this.userRepo.create({
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

    if (body.role === UserRole.expert) {
      let expert = await this.expertProfileRepo.save({
        userId: newUser.id,
      });
      newUser = { ...newUser, ...expert };
    }

    const tokens = await this.getToken(newUser);
    await this.userRepo.save(newUser);
    return { ...tokens, user: newUser };
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
        HttpStatus.UNAUTHORIZED,
      );
    }

    const tokens = await this.getToken(userDetails);
    return { ...tokens, user: userDetails };
  }

  async facebookSignup() {}

  async login(user: LoginDto) {
    const userDetails = await this.userRepo.findOneBy({ email: user.email });
    const passwordValidation = hashText(user.password);

    if (!userDetails || passwordValidation !== userDetails.password) {
      throw new HttpException(
        `Invalid login credentials, ensure you are sending the right email and password and try again`,
        HttpStatus.UNAUTHORIZED,
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
          expiresIn: 60 * 60 * 24 * 30,
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
          expiresIn: 60 * 60 * 24 * 30,
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
      hasRefreshToken: 'alice',
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

  async getLoggedInUser(user: JwtContent) {
    return await this.userRepo.findOneBy({
      id: user.uid,
    });
  }

  getOtpCodeEntry(email) {
    return this.verificationCodeRepo.findOneBy({
      email: email,
    });
  }

  async forgetPasswordRequestOtp({ email }: { email: string }) {
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
        verified: false,
      };
      data = this.verificationCodeRepo.update(codeEntry.id, data);
    }

    try {
      await this.mailService.sendMail({
        from: 'notification@prepmeets.com',
        to: email,
        subject: `Password reset`,
        text: `Your verification code is ${otp}`,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return `code sent to ${email}`;
  }

  async verifyForgetPasswordOtp(email: string, code: number) {
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

    return await this.verificationCodeRepo.update(codeEntry.id, {
      verified: true,
      type: VerificationCodeType.forgotPassword,
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

      if (user.emailVerified) {
        throw new HttpException(
          `Email already verified`,
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
          from: 'notification@prepmeets.com',
          to: user.email,
          subject: `Verify email`,
          html: `<p>Click on the link below to verify your email. If you did not request for this, please ignore this message <a href=${url}>Click here to verify !</a></p>`,
        });
      } catch (error) {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
      return `Email sent to ${user.email}`;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async emailVerification(email: string) {
    const emailEntry = await this.verificationEmailRepo.findOneBy({
      email: email,
    });

    if (emailEntry.verified) {
      throw new HttpException(
        `Account already verified or Verification code already used`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.getUserByEmail({ email });

    await this.userRepo.update(user.id, {
      emailVerified: true,
    });
    return await this.verificationEmailRepo.update(emailEntry.id, {
      verified: true,
    });
  }

  async resetPassword(email: string, password: string) {
    const codeEntry = await this.getOtpCodeEntry(email);

    if (!codeEntry?.verified) {
      throw new HttpException(
        `Ensure to have verified your otp`,
        HttpStatus.NOT_FOUND,
      );
    }

    const user = await this.getUserByEmail({ email });
    if (!user) {
      throw new HttpException(
        `User with the associated email not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.userRepo.update(user.id, {
      password: hashText(password),
    });

    await this.verificationCodeRepo.save({
      ...codeEntry,
      verified: false,
    });
    return `Done`;
  }

  async changePassword(id: number, newPassword: string, oldPassword: string) {
    const oldPwdHash = hashText(oldPassword);
    const user = await this.getUserById(id);
    if (oldPwdHash !== user.password) {
      throw new HttpException(
        `Old password doesn't match`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return await this.userRepo.update(id, { password: hashText(newPassword) });
  }

  async getAllUserByRole(role: UserRole) {
    return await this.userRepo.find({
      where: {
        role: role,
      },
    });
  }

  async updateProfile(id: number, profileInfo: UpdateProfileDto) {
    let userInfo = await this.userRepo.findOne({
      where: {
        id: id,
      },
    });

    if (!userInfo) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }

    const basicProfileInfo = {
      firstName: profileInfo?.firstName,
      lastName: profileInfo?.lastName,
      country: profileInfo?.country,
      location: profileInfo?.location,
      gender: profileInfo?.gender,
      profilePhoto: profileInfo?.profilePhoto,
      dateOfBirth: profileInfo?.dateOfBirth,
      phoneNumber: profileInfo?.phoneNumber,
    };

    return await this.userRepo.update(userInfo.id, basicProfileInfo);
  }
}
