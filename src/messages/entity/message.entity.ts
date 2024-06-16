import { User } from 'src/auth/entities/auth.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string;

  @Column()
  senderId: number;

  @ManyToOne(() => User, (user) => user.sender)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  receiverId: number;

  @ManyToOne(() => User, (user) => user.receiver)
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  conversationId: number;

  @ManyToOne(() => Conversation, (user) => user.message)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
