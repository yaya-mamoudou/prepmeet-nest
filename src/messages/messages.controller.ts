import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/conversation.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SendMessageDto } from './dto/message.dto';
import {
  CreateConversationExample,
  SendMessageExample,
} from 'src/auth/examples/message';

@Controller('messages')
@ApiTags('Messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/create-conversation')
  @ApiOperation({
    summary: 'Create conversation between a client/Expert and Expert/Expert',
  })
  @ApiBody({
    type: CreateConversationDto,
    examples: {
      CreateConversation: {
        value: CreateConversationExample,
      },
    },
  })
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('jwt'))
  createConversation(@Request() req: any, @Body() body: CreateConversationDto) {
    const user = req.user;
    return this.messagesService.createConversation(body, user);
  }

  @Get('/conversations')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all a users conversations',
  })
  getAllConversations(@Request() req: any) {
    const user = req.user;
    return this.messagesService.getAllConversation(user);
  }

  @Post('/send-message')
  @ApiOperation({
    summary: 'Send a message',
  })
  @ApiBody({
    type: SendMessageDto,
    examples: {
      CreateConversation: {
        value: SendMessageExample,
      },
    },
  })
  @UsePipes(ValidationPipe)
  @UseGuards(AuthGuard('jwt'))
  sendMessage(@Request() req: any, @Body() body: SendMessageDto) {
    const user = req.user;
    return this.messagesService.sendMessage(body, user);
  }

  @Get('/:conversationId')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Get all a users messages',
  })
  getAllMessages(
    @Request() req: any,
    @Param('conversationId') conversationId: number,
  ) {
    const user = req.user;
    return this.messagesService.getAllMessages(user, conversationId);
  }
}
