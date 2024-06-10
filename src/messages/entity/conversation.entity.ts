import { User } from 'src/auth/entities/auth.entity';
import { VisibilityLevel } from 'src/utils/enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('conversation')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  initiatorId: number;

  @OneToOne(() => User, (user) => user.initiator)
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @Column({ nullable: true })
  initiatorWithUserId: number;

  @OneToOne(() => User, (user) => user.initiatorWithUser)
  @JoinColumn({ name: 'initiatorWithUserId' })
  initiatorWithUser: User;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
