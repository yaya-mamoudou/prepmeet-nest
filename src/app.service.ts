import { Injectable } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { ExpertProfileService } from './expert-profile/expert-profile.service';
import { JwtContent } from './utils/types';
import { UserRole } from './utils/enum';

@Injectable()
export class AppService {
  constructor(
    private readonly authService: AuthService,
    private readonly expertProfileService: ExpertProfileService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getLoggedInUser(user: JwtContent) {
    if (user.role === UserRole.client) {
      return this.authService.getLoggedInUser(user);
    }
    return this.expertProfileService.getExpertProfileById(user.uid);
  }

  async getAllFocusArea() {
    return this.expertProfileService.getFocusArea();
  }
}
