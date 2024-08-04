import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { GoogleService } from './google.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@Controller('google')
@ApiTags('Google')
export class GoogleController {
  constructor(private readonly googleService: GoogleService) {}

  @Get('generate-url')
  @UseGuards(AuthGuard('jwt'))
  generateUrl() {
    return this.googleService.generateUrl();
  }

  @Post('store-token')
  @UseGuards(AuthGuard('jwt'))
  generateMeetingLink(@Body() body: { code: string }, @Request() req: any) {
    const user = req.user;
    return this.googleService.storeGoogleRefreshToken(body.code, user);
  }

  @Post('generate-link')
  @UseGuards(AuthGuard('jwt'))
  createMeetingLink(@Body() body: { code: string }, @Request() req: any) {
    const user = req.user;
    return this.googleService.createMeetingLink(user);
  }
}
