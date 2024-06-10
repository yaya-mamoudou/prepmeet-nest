import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/conversation.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/create-conversation')
  @ApiOperation({
    summary: 'Create conversation between a client/Expert and Expert/Expert',
  })
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('jwt'))
  createConversation(@Request() req: any, @Body() body: CreateConversationDto) {
    const user = req.user;

    return this.messagesService.createConversation(body, user);
  }
}
