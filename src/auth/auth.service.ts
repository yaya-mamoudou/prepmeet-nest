import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './entities/auth.entity';
import { RegisterDto } from './dto/auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashText } from 'src/utils/util';
import { UserRole } from 'src/utils/enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async registerUser(user: RegisterDto) {
    let userDetails = await this.userRepo.findOneBy({ email: user.email });

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

    return await this.userRepo.save(data);
  }
}
