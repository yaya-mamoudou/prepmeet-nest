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
import { Availability } from 'src/session/entities/availability';
import { AuthModule } from 'src/auth/auth.module';
import { UserFocusArea } from './entities/user-focus-area.entity';
import { DocumentManagementModule } from 'src/document-management/document-management.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpertProfile,
      FocusArea,
      Degrees,
      EducationalExperience,
      Certification,
      Availability,
      UserFocusArea,
    ]),
    StripeModule.forRootAsync(),
    AuthModule,
    DocumentManagementModule,
  ],
  providers: [ExpertProfileService, AtStrategy, RtStrategy, ExpertRoleStrategy],
  controllers: [ExpertProfileController],
  exports: [ExpertProfileService],
})
export class ExpertProfileModule {}
