import { HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserRole } from 'src/utils/enum';

export class ClientRoleStrategy extends PassportStrategy(
  Strategy,
  'client-role',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'at-secret',
    });
  }
  validate(payload: any) {
    if (payload.role !== UserRole.client) {
      throw new HttpException(
        `Unauthorized, this action is dedicated for clients`,
        HttpStatus.UNAUTHORIZED,
      );
    }
    return payload;
  }
}
