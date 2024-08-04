import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller()
@ApiBearerAuth()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get logged in user',
  })
  getAllSessions(@Request() req: any) {
    const user = req.user;
    return this.appService.getLoggedInUser(user);
  }

  @Get('/list/focus-area')
  @ApiOperation({
    summary: 'Get All focus areas',
  })
  getAllFocusArea(@Request() req: any) {
    const user = req.user;
    return this.appService.getAllFocusArea();
  }
}
