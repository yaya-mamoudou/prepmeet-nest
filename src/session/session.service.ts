import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { CreateSessionDto } from './dto/session.dto';
import { JwtContent } from 'src/utils/types';
import { AuthService } from 'src/auth/auth.service';
import { Session } from './entities/session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PusherService } from 'src/pusher/pusher.service';
import { SessionStatus, StripePaymentStatus, UserRole } from 'src/utils/enum';
import { StripeService } from 'src/stripe/stripe.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';

@Injectable()
export class SessionService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    private pusherService: PusherService,
    private stripeService: StripeService,
  ) {}

  async createSession(body: CreateSessionDto, user: JwtContent) {
    const expert = await this.authService.getUserById(body.expertId);
    if (expert?.role !== UserRole.expert) {
      throw new HttpException(
        `You can schedule sessions only with an expert`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const stripeSession = await this.stripeService.createCheckoutSession(
      body.pricingUrl,
      body.numberOfSlots,
    );

    return await this.sessionRepo.save({
      ...body,
      price: stripeSession.amount_total / 100,
      clientId: user.uid,
      paymentUrl: stripeSession.url,
      createdDate: new Date(),
      updatedDate: new Date(),
      stripeSessionId: stripeSession.id,
    });
  }

  async getAllSessions(user: JwtContent) {
    return this.sessionRepo
      .createQueryBuilder('session')
      .where('(session.clientId = :userId OR session.expertId = :userId)', {
        userId: user.uid,
      })
      .leftJoinAndSelect('session.client', 'client')
      .leftJoinAndSelect('session.expert', 'expert')
      .addOrderBy('session.updatedDate', 'DESC')
      .getMany();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkPaymentStatus() {
    const expirationTimeInMinutes = 30;

    const allPendingSessions = await this.sessionRepo.find({
      where: {
        stripePaymentStatus: SessionStatus.pending,
      },
    });

    if (!allPendingSessions) {
      return;
    }

    for (let i = 0; i < allPendingSessions.length; i++) {
      const session = allPendingSessions[i];
      let data = {
        ...session,
      };

      const timeDifference = moment(new Date()).diff(session.createdDate, 'm');

      if (
        timeDifference > expirationTimeInMinutes &&
        session.stripePaymentStatus !== StripePaymentStatus.expired
      ) {
        await this.stripeService.expireSession(session.stripeSessionId);
        data = {
          ...data,
          stripePaymentStatus: StripePaymentStatus.expired,
          status: SessionStatus.canceled,
          updatedDate: new Date(),
        };
      }

      let paymentResponse = await this.stripeService.getSession(
        session.stripeSessionId,
      );

      if (
        paymentResponse.status === StripePaymentStatus.complete &&
        paymentResponse.payment_status === 'paid'
      ) {
        data = {
          ...data,
          stripePaymentStatus: StripePaymentStatus.paid,
          status: SessionStatus.booked,
          updatedDate: new Date(),
        };
      }
      if (
        paymentResponse.status === StripePaymentStatus.complete &&
        paymentResponse.payment_status === 'unpaid'
      ) {
        data = {
          ...data,
          stripePaymentStatus: StripePaymentStatus.unpaid,
          status: SessionStatus.canceled,
          updatedDate: new Date(),
        };
      }

      if (paymentResponse.status == 'expired') {
        data = {
          ...data,
          stripePaymentStatus: StripePaymentStatus.expired,
          status: SessionStatus.canceled,
          updatedDate: new Date(),
        };
      }

      await this.sessionRepo.update(session.id, data);
    }
  }
}
