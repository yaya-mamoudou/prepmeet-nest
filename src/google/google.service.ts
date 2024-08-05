import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { google } from 'googleapis';
import { AuthService } from 'src/auth/auth.service';
import { GoogleRefreshToken } from './entities/google-refresh-token';
import { Repository } from 'typeorm';
import { JwtContent } from 'src/utils/types';
import axios from 'axios';

@Injectable()
export class GoogleService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(GoogleRefreshToken)
    private googleTokenRepo: Repository<GoogleRefreshToken>,
  ) {}
  initGoogleApi(redirectUri?: string) {
    console.log(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'client ID',
    );

    return new google.auth.OAuth2({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: redirectUri || 'http://localhost:3000',
    });
  }

  async generateUrl() {
    const oauth2Client = this.initGoogleApi();
    const scopes = [
      'https://www.googleapis.com/auth/meetings.space.created',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
    ];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    return url;
  }

  async storeGoogleRefreshToken(code: string, user: JwtContent) {
    console.log('alice');

    const {
      tokens: { refresh_token },
    } = await this.initGoogleApi().getToken(code);

    console.log(refresh_token, 'yhhh');

    return await this.googleTokenRepo.save({
      userId: user.uid,
      refreshToken: refresh_token,
      createdDate: new Date(),
      updatedDate: new Date(),
    });
  }

  async getAccessToken() {
    try {
      const refreshToken = await this.googleTokenRepo.findOneBy({
        id: 1,
      });

      const {
        data: { access_token },
      } = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
        refresh_token: refreshToken?.refreshToken,
        grant_type: 'refresh_token',
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      });

      return { access_token };
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

  async createMeetingLink(meetingPayload) {
    try {
      const payload = {
        summary: 'Meeting with Alice',
        description: 'Sup girl',
        location: 'Google Meet',
        attendees: [
          {
            email: 'yayamamoudou0@gmail.com',
            displayName: 'Yaya',
            comment: 'hey lets meet',
            responseStatus: 'needsAction',
          },
          {
            email: 'alice.ndeh@mynkwa.com',
            displayName: 'Alice',
            comment: 'hey lets meet alice',
            responseStatus: 'needsAction',
          },
        ],
        start: {
          dateTime: '2024-07-22T16:00:00',
          timeZone: 'Africa/Douala',
        },
        end: {
          dateTime: '2024-07-22T16:40:00',
          timeZone: 'Africa/Douala',
        },
        conferenceData: {
          createRequest: {
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
            requestId: 'dfkljdlk',
          },
        },
      };
      const token = await this.getAccessToken();

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.access_token}`,
        },
        params: {
          sendNotifications: true,
        },
        data: JSON.stringify(meetingPayload),
      };

      const response = await axios.request(config);

      return response?.data;
    } catch (e) {
      console.log(e?.response?.data?.error?.errors, 'in failed');

      throw new InternalServerErrorException(e);
    }
  }
}

// url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
