import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SessionService } from './session.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateSessionDto } from './dto/session.dto';
import { CreateSessionExample } from 'src/auth/examples/session';
import { Availability } from './entities/availability';

@Controller('session')
@ApiBearerAuth()
@ApiTags('Session')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}
  @Post('/create-session')
  @ApiOperation({
    summary: 'Create session between a client/Expert and Expert/Expert',
  })
  @ApiBody({
    type: CreateSessionDto,
    examples: {
      CreateConversation: {
        value: CreateSessionExample,
      },
    },
  })
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('jwt'))
  createSession(@Request() req: any, @Body() body: CreateSessionDto) {
    const user = req.user;
    return this.sessionService.createSession(body, user);
  }

  @Get('')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all users sessions',
  })
  getAllSessions(@Request() req: any) {
    const user = req.user;
    return this.sessionService.getAllSessions(user);
  }
}
