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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SendMessageDto } from './dto/message.dto';
import {
  CreateConversationExample,
  SendMessageExample,
} from 'src/auth/examples/message';
import {
  ApiOkPaginatedResponse,
  ApiPaginationQuery,
  Paginate,
  PaginateQuery,
} from 'nestjs-paginate';
import { Conversation } from './entity/conversation.entity';
import { PAGINATION_PARAM } from 'src/utils/types';

@Controller('messages')
@ApiBearerAuth()
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
  @ApiOkPaginatedResponse(Conversation, PAGINATION_PARAM)
  @ApiPaginationQuery(PAGINATION_PARAM)
  @ApiOperation({
    summary: 'Get all a users conversations',
  })
  getAllConversations(@Request() req: any, @Paginate() query: PaginateQuery) {
    const user = req.user;
    return this.messagesService.getAllConversation(user, query);
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
  @ApiOkPaginatedResponse(Conversation, PAGINATION_PARAM)
  @ApiPaginationQuery(PAGINATION_PARAM)
  getAllMessages(
    @Request() req: any,
    @Param('conversationId') conversationId: number,
    @Paginate() query: PaginateQuery,
  ) {
    const user = req.user;
    return this.messagesService.getAllMessages(user, conversationId, query);
  }
}
