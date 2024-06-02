import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/auth.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashText } from 'src/utils/util';
import { UserRole } from 'src/utils/enum';
import { JwtService } from '@nestjs/jwt';

export interface JWTTokens {
  accessToken: string;
  refeshToken: string;
  // accessTokenExpiresIn: string;
  // refreshToken: string;
  // refreshTokenExpiresIn: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

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
    return tokens;
  }

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

    return tokens;
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
}
