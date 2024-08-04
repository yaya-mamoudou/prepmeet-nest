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
import { ExpertProfileService } from 'src/expert-profile/expert-profile.service';
import { GoogleService } from 'src/google/google.service';
import { generateRandomString } from 'src/utils/util';

@Injectable()
export class SessionService {
  constructor(
    private readonly authService: AuthService,
    private readonly expertProfileService: ExpertProfileService,
    @InjectRepository(Session)
    private sessionRepo: Repository<Session>,
    private pusherService: PusherService,
    private stripeService: StripeService,
    private googleService: GoogleService,
  ) {}

  async createSession(body: CreateSessionDto, user: JwtContent) {
    let response = [];
    const expert = await this.authService.getUserById(body.expertId);
    if (expert?.role !== UserRole.expert) {
      throw new HttpException(
        `You can schedule sessions only with an expert`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const stripeSession = await this.stripeService.createCheckoutSession(
      body.pricingUrl,
      body.slot.length,
    );

    for (let i = 0; i < body.slot.length; i++) {
      const weekDay = moment(body.slot[i].meetingDate)
        .format('dddd')
        .toLocaleLowerCase();

      const expertsAvailabilitySlot =
        await this.expertProfileService.getSlotBySlotAndDay(
          weekDay,
          body.slot[i].from,
          body.slot[i].to,
        );

      if (!expertsAvailabilitySlot) {
        response.push(
          `This expert isn't available at this time ${weekDay} from:${body.slot[i].from}, to:${body.slot[i].to}`,
        );
        continue;
      }

      const session = await this.getSessionBySlotInfo(
        body.slot[i].meetingDate,
        body.slot[i].from,
        body.slot[i].to,
      );

      if (session) {
        response.push(
          `This session already exists ${weekDay} from:${body.slot[i].from}, to:${body.slot[i].to}`,
        );
        continue;
      }

      if (!body.slot[i].from || !body.slot[i].to || !body.slot[i].meetingDate) {
        continue;
      }
      await this.sessionRepo.save({
        ...body,
        price: stripeSession.amount_total / 100,
        clientId: user.uid,
        paymentUrl: stripeSession.url,
        createdDate: new Date(),
        updatedDate: new Date(),
        stripeSessionId: stripeSession.id,
        meetingDate: body.slot[i].meetingDate,
        slot: {
          from: body.slot[i].from,
          to: body.slot[i].to,
        },
      });
    }

    return response;
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

  // @Cron(CronExpression.EVERY_5_MINUTES)
  async checkPaymentStatus() {
    console.log('runing cron');

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
        const expert = await this.authService.getUserById(session?.expertId);
        const client = await this.authService.getUserById(session?.clientId);

        let meetingPayload = {
          summary: `Meeting with ${expert?.firstName} ${expert?.lastName} & ${client?.firstName} ${client?.lastName}`,
          description: `Meeting happening on ${session?.meetingDate}`,
          location: 'Google Meet',
          attendees: [
            {
              email: expert?.email,
              displayName: `${expert?.firstName} ${expert?.lastName}`,
              responseStatus: 'needsAction',
            },
            {
              email: client?.email,
              displayName: `${client?.firstName} ${client?.lastName}`,
              responseStatus: 'needsAction',
            },
          ],
          start: {
            dateTime: `${moment(session?.meetingDate)?.format('YYYY-MM-DD')}T${
              session?.slot?.from
            }:00`,
            timeZone: 'Africa/Douala',
          },
          end: {
            dateTime: `${moment(session?.meetingDate)?.format('YYYY-MM-DD')}T${
              session?.slot?.to
            }:00`,
            timeZone: 'Africa/Douala',
          },
          conferenceData: {
            createRequest: {
              conferenceSolutionKey: {
                type: 'hangoutsMeet',
              },
              requestId: generateRandomString(),
            },
          },
          params: {
            sendNotifications: true,
          },
          reminders: {
            useDefault: true,
          },
        };

        const generateCalenderAppointment =
          await this.googleService.createMeetingLink(meetingPayload);

        data = {
          ...data,
          stripePaymentStatus: StripePaymentStatus.paid,
          status: SessionStatus.booked,
          updatedDate: new Date(),
          meetingUrl: generateCalenderAppointment?.hangoutLink,
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

  async getSessionBySlotInfo(date: Date, from: string, to: string) {
    return this.sessionRepo
      .createQueryBuilder('session')
      .where('session.meetingDate = :meetingDate', { meetingDate: date })
      .andWhere('JSON_EXTRACT(session.slot, "$.from") = :from', { from })
      .andWhere('JSON_EXTRACT(session.slot, "$.to") = :to', { to })
      .andWhere('session.status NOT IN (:excludedStatuses)', {
        excludedStatuses: ['CANCELED', 'EXPIRED'],
      })
      .getOne();
  }
}
