import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entity/conversation.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PusherModule } from 'src/pusher/pusher.module';
import { Message } from './entity/message.entity';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService],
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    AuthModule,
    PusherModule,
  ],
})
export class MessagesModule {}
