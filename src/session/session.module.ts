import { Module, forwardRef } from '@nestjs/common';
import { SessionController } from './session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PusherModule } from 'src/pusher/pusher.module';
import { SessionService } from './session.service';
import { StripeModule } from 'src/stripe/stripe.module';
import { ExpertProfileModule } from 'src/expert-profile/expert-profile.module';
import { GoogleModule } from 'src/google/google.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Session]),
    AuthModule,
    GoogleModule,
    ExpertProfileModule,
    PusherModule,
    StripeModule.forRootAsync(),
  ],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
