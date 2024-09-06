import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  ApiOkPaginatedResponse,
  ApiPaginationQuery,
  Paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { FocusArea } from './expert-profile/entities/focus-area.entity';
import { FOCUS_AREA_PAGINATION_PARAM, PAGINATION_PARAM } from './utils/types';

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
  @ApiOkPaginatedResponse(FocusArea, FOCUS_AREA_PAGINATION_PARAM)
  @ApiPaginationQuery(FOCUS_AREA_PAGINATION_PARAM)
  getAllFocusArea(@Paginate() query: PaginateQuery) {
    return this.appService.getAllFocusArea(query);
  }

  @Get('/list/degrees')
  @ApiOperation({
    summary: 'Get All degess',
  })
  @ApiOkPaginatedResponse(FocusArea, FOCUS_AREA_PAGINATION_PARAM)
  @ApiPaginationQuery(FOCUS_AREA_PAGINATION_PARAM)
  getAllDegrees(@Paginate() query: PaginateQuery) {
    return this.appService.getAllDegrees(query);
  }
}
