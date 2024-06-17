import { Module } from '@nestjs/common';
import { ExpertProfileService } from './expert-profile.service';
import { ExpertProfileController } from './expert-profile.controller';
import { AtStrategy, RtStrategy } from 'src/auth/stategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertProfile } from './entities/expert-profile.entity';
import { ExpertRoleStrategy } from './strategies/expert-role.strategy';
import { FocusArea } from './entities/focus-area.entity';
import { Degrees } from './entities/degrees.entity';
import { EducationalExperience } from './entities/educational-experience.entity';
import { Certification } from './entities/certification.entity';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpertProfile,
      FocusArea,
      Degrees,
      EducationalExperience,
      Certification,
    ]),
    StripeModule.forRootAsync(),
  ],
  providers: [ExpertProfileService, AtStrategy, RtStrategy, ExpertRoleStrategy],
  controllers: [ExpertProfileController],
})
export class ExpertProfileModule {}
