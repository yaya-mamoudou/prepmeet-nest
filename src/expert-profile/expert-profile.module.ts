import { Module } from '@nestjs/common';
import { ExpertProfileService } from './expert-profile.service';
import { ExpertProfileController } from './expert-profile.controller';
import { AtStrategy, RtStrategy } from 'src/auth/stategies';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertProfile } from './entities/expert-profile.entity';
import { ExpertRoleStrategy } from './strategies/expert-role.strategy';
import { FocusArea } from './entities/focus-area.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertProfile, FocusArea])],
  providers: [ExpertProfileService, AtStrategy, RtStrategy, ExpertRoleStrategy],
  controllers: [ExpertProfileController],
})
export class ExpertProfileModule {}
