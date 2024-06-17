import { User } from 'src/auth/entities/auth.entity';
import { VisibilityLevel } from 'src/utils/enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './message.entity';
// import { Message } from './messages.entity';

@Entity('conversation')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  initiatorId: number;

  @ManyToOne(() => User, (user) => user.initiator)
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @Column({ nullable: true })
  initiatorWithUserId: number;

  @ManyToOne(() => User, (user) => user.initiatorWithUser)
  @JoinColumn({ name: 'initiatorWithUserId' })
  initiatorWithUser: User;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @OneToMany(() => Message, (message) => message.conversation)
  message: Message[];
}
