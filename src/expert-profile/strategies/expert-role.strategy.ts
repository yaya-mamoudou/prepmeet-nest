import { HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserRole } from 'src/utils/enum';

export class ExpertRoleStrategy extends PassportStrategy(
  Strategy,
  'expert-role',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'at-secret',
    });
  }
  validate(payload: any) {
    if (payload.role !== UserRole.expert) {
      throw new HttpException(
        `Unauthorizd, this action is dedicated for admins`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return payload;
  }
}
