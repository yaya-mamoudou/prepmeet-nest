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

@Entity('availability')
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  day: string;

  @Column({ nullable: true, type: 'json' })
  slot: Slots;

  @Column()
  expertId: number;

  @ManyToOne(() => User, (user) => user.clientBooking)
  @JoinColumn({ name: 'expertId' })
  expert: User;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
