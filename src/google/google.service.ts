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
      'https://www.googleapis.com/auth/chat.spaces',
      'https://www.googleapis.com/auth/chat.spaces.create',
      'https://www.googleapis.com/auth/chat.memberships',
      'https://www.googleapis.com/auth/chat.spaces.readonly',
      'https://www.googleapis.com/auth/chat.admin.memberships',
      'https://www.googleapis.com/auth/chat.memberships',
      'https://www.googleapis.com/auth/chat.memberships.app',

      'openid',
    ];
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    return url;
  }

  async storeGoogleRefreshToken(code: string, user: JwtContent) {
    const {
      tokens: { refresh_token },
    } = await this.initGoogleApi().getToken(code);

    return await this.googleTokenRepo.save({
      userId: user.uid,
      refreshToken: refresh_token,
      createdDate: new Date(),
      updatedDate: new Date(),
    });
  }

  async getAccessToken() {
    try {
      const refreshToken = await this.googleTokenRepo.find();

      const {
        data: { access_token },
      } = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
        refresh_token: refreshToken?.[0]?.refreshToken,
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
      console.log(response.data, 'yooo');

      return response?.data;
    } catch (e) {
      console.log(e?.response?.data?.error?.errors, 'in failed');

      throw new InternalServerErrorException(e);
    }
  }

  async endActiveMeeting() {
    try {
      const token = await this.getAccessToken();

      let config = {
        // method: 'post',
        method: 'post',
        // maxBodyLength: Infinity,
        url: `https://meet.googleapis.com/v2/spaces/eGqZ0clw-GUB:endActiveConference`,
        // url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        // url: 'https://meet.googleapis.com/v2/spaces',
        // url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
        // url: 'https://www.googleapis.com/calendar/v3/calendars/wandaprep@gmail.com/events/a284dG5icXQwM2RncW9rOGJvMTk1YTI3cDQgd2FuZGFwcmVwQG0',
        // url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
        // url: 'https://chat.googleapis.com/v1/spaces',
        // url: 'https://chat.googleapis.com/v1/spaces/p36YZEDFv5YB/members',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.access_token}`,
        },
        // params: {
        //   sendNotifications: true,
        // },
        // data: JSON.stringify({
        //   config: {
        //     accessType: 'OPEN',
        //     entryPointAccess: 'ALL',
        //   },
        // }),
      };
      const response = await axios.request(config);
      console.log(response.data, 'response here');
      return response.data;
    } catch (e) {
      console.log(e?.response, 'failed to end conference');
      // return e?.response;
      // throw new InternalServerErrorException(e);
    }
  }
}

const payload = {
  summary: 'Meeting with Alice',
  description: 'Sup girl',
  location: 'https://meet.google.com/vhi-odqy-bos',
  attendees: [
    {
      email: 'yayamamoudou0@gmail.com',
      displayName: 'Yaya',
      comment: 'hey lets meet',
      responseStatus: 'needsAction',
    },
    {
      email: 'alicendeh16@gmail.com',
      displayName: 'Alice',
      comment: 'hey lets meet alice',
      responseStatus: 'needsAction',
    },
  ],
  start: {
    dateTime: '2024-08-11T23:25:00',
    timeZone: 'Africa/Douala',
  },
  end: {
    dateTime: '2024-08-11T23:40:00',
    timeZone: 'Africa/Douala',
  },
  conferenceData: {
    createRequest: {
      conferenceSolutionKey: {
        type: 'hangoutsMeet',
      },
      requestId: 'dfkljdlk',
    },
    entryPoints: [
      {
        entryPointType: 'video',
        uri: 'https://meet.google.com/vhi-odqy-bos',
        label: 'Google Meet',
      },
    ],
  },
};

const pathload = {
  // kind: 'calendar#event',
  // etag: '"3446831246280000"',
  // id: 'ko8tnbqt03dgqok8bo195a27p4',
  // status: 'confirmed',
  // htmlLink:
  //   'https://www.google.com/calendar/event?eid=a284dG5icXQwM2RncW9rOGJvMTk1YTI3cDQgd2FuZGFwcmVwQG0',
  // created: '2024-08-11T22:33:43.000Z',
  // updated: '2024-08-11T22:33:43.140Z',
  // summary: 'Meeting with Alice',
  // description: 'Sup girl',
  // location: 'Meet',
  start: {
    dateTime: '2024-08-11T18:25:00-04:00',
    timeZone: 'Africa/Lagos',
  },
  end: {
    dateTime: '2024-08-11T18:40:00-04:00',
    timeZone: 'Africa/Lagos',
  },
  // creator: {
  //   email: 'wandaprep@gmail.com',
  //   self: true,
  // },
  // organizer: {
  //   email: 'wandaprep@gmail.com',
  //   self: true,
  // },

  // iCalUID: 'ko8tnbqt03dgqok8bo195a27p4@google.com',
  // sequence: 0,
  // attendees: [
  //   {
  //     email: 'alicendeh16@gmail.com',
  //     displayName: 'Alice',
  //     responseStatus: 'needsAction',
  //     comment: 'hey lets meet alice',
  //   },
  //   {
  //     email: 'yayamamoudou0@gmail.com',
  //     displayName: 'Yaya',
  //     responseStatus: 'needsAction',
  //     comment: 'hey lets meet',
  //   },
  // ],
  // hangoutLink: 'https://meet.google.com/vhi-odqy-bos',
  // conferenceData: {
  //   createRequest: {
  //     requestId: 'dfkljdlk',
  //     conferenceSolutionKey: {
  //       type: 'hangoutsMeet',
  //     },
  //     status: {
  //       statusCode: 'success',
  //     },
  //   },
  //   entryPoints: [
  //     {
  //       entryPointType: 'video',
  //       uri: 'https://meet.google.com/vhi-odqy-bos',
  //       label: 'meet.google.com/vhi-odqy-bos',
  //     },
  //   ],
  //   conferenceSolution: {
  //     key: {
  //       type: 'hangoutsMeet',
  //     },
  //     name: 'Google Meet',
  //     iconUri:
  //       'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png',
  //   },
  //   conferenceId: 'vhi-odqy-bos',
  // },
  // reminders: {
  //   useDefault: true,
  // },
  // eventType: 'default',
};
