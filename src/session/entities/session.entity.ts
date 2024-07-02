import { User } from 'src/auth/entities/auth.entity';
import { SessionStatus } from 'src/utils/enum';
import { Slots } from 'src/utils/types';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('session')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: SessionStatus.pending })
  status: SessionStatus;

  @Column()
  price: number;

  @Column()
  sessionType: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  meetingDate: Date;

  @Column({ nullable: true })
  meetingUrl: string;

  // @Column()
  // startTime: Date;

  // @Column()
  // endTime: Date;

  @Column({ type: 'json' })
  slot: Slots;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  paymentUrl: string;

  @Column({ type: 'varchar', nullable: true })
  stripeSessionId: string;

  @Column({ default: SessionStatus.pending })
  stripePaymentStatus: string;

  @Column()
  expertId: number;

  @ManyToOne(() => User, (user) => user.sessionExpert)
  @JoinColumn({ name: 'expertId' })
  expert: User;

  @Column()
  clientId: number;

  @ManyToOne(() => User, (user) => user.sessionClient)
  @JoinColumn({ name: 'clientId' })
  client: User;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
