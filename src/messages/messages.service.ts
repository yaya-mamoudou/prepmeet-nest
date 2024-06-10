import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entity/conversation.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';
import { UserRole } from 'src/utils/enum';
import { User } from 'src/auth/entities/auth.entity';
import { JwtContent } from 'src/utils/types';

@Injectable()
export class MessagesService {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
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

    const conversation = await this.conversationRepo
      .createQueryBuilder('conversation')
      .where('conversation.initiatorId = :userId', { userId: user.uid })
      .orWhere('conversation.initiatorId = :initiatorWithUserId', {
        initiatorWithUserId: body.initiatorWithUserId,
      })
      .andWhere(
        '(conversation.initiatorWithUserId = :userId OR conversation.initiatorWithUserId = :initiatorWithUserId)',
        { userId: user.uid, initiatorWithUserId: body.initiatorWithUserId },
      )
      .getOne();

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
}
