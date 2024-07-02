import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entity/conversation.entity';
import { In, Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserRole } from 'src/utils/enum';
import { User } from 'src/auth/entities/auth.entity';
import { JwtContent } from 'src/utils/types';
import { SendMessageDto } from './dto/message.dto';
import { PusherService } from 'src/pusher/pusher.service';
import { PusherChannels, PusherEvents } from 'src/constants';
import { Message } from './entity/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    private pusherService: PusherService,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async createConversation(body: CreateConversationDto, user: JwtContent) {
    if (body.initiatorWithUserId === user.uid) {
      throw new HttpException(
        `Cant initiate a conversation with yourself`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const initiatedWith = await this.authService.getUserById(
      body.initiatorWithUserId,
    );
    if (
      initiatedWith.role !== UserRole.expert &&
      user.role !== UserRole.expert
    ) {
      throw new HttpException(
        `Conversations can only happen with experts`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const conversation = await this.conversationRepo.findOne({
      where: {
        initiatorId: In([user.uid, body.initiatorWithUserId]),
        initiatorWithUserId: In([user.uid, body.initiatorWithUserId]),
      },
    });

    if (conversation) {
      throw new HttpException(
        'A conversation exists already between these two entities',
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.conversationRepo.save({
      initiatorId: user.uid,
      initiatorWithUserId: body.initiatorWithUserId,
      createdDate: new Date(),
      updatedDate: new Date(),
    });
  }

  async getConversation(conversationId: number) {
    return this.conversationRepo.findOneBy({
      id: conversationId,
    });
  }

  async getAllConversation(user: JwtContent) {
    return this.conversationRepo
      .createQueryBuilder('conversation')
      .where(
        '(conversation.initiatorWithUserId = :userId OR conversation.initiatorId = :userId)',
        { userId: user.uid },
      )
      .leftJoinAndSelect('conversation.initiator', 'initiator')
      .leftJoinAndSelect('conversation.initiatorWithUser', 'initiatorWithUser')
      .addOrderBy('conversation.updatedDate', 'DESC')
      .getMany();
  }

  async sendMessage(body: SendMessageDto, user: JwtContent) {
    const conversation = await this.getConversation(body.conversationId);
    if (!conversation) {
      throw new HttpException(
        'Cant send message, this conversation ID is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }

    const members = [
      conversation.initiatorWithUserId,
      conversation.initiatorId,
    ];

    if (!members.includes(body.receiverId) || !members.includes(user.uid)) {
      throw new HttpException(
        'No existing conversation',
        HttpStatus.BAD_REQUEST,
      );
    }

    const message = await this.messageRepo.save({
      ...body,
      senderId: user.uid,
      createdDate: new Date(),
      updatedDate: new Date(),
    });

    const sendersChannel = `${PusherChannels.CHAT}-${user.uid}`;
    await this.pusherService.trigger(
      sendersChannel,
      PusherEvents.MESSAGE,
      message,
    );

    const receiversChannel = `${PusherChannels.CHAT}-${body.receiverId}`;
    await this.pusherService.trigger(
      receiversChannel,
      PusherEvents.MESSAGE,
      message,
    );

    await this.conversationRepo.update(body.conversationId, {
      updatedDate: new Date(),
    });
    return message;
  }

  async getAllMessages(user: JwtContent, id: number) {
    const conversation = await this.getConversation(id);
    const members = [
      conversation.initiatorWithUserId,
      conversation.initiatorId,
    ];
    if (!members.includes(user.uid)) {
      throw new HttpException(
        'No existing conversation',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.messageRepo.find({
      where: {
        conversationId: id,
      },
      order: {
        updatedDate: 'DESC',
      },
    });
  }
}
