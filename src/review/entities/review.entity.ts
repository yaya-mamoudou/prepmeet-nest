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

@Entity('review')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  message: string;

  @Column({ nullable: true })
  rating: number;

  @Column()
  reviewerId: number;

  @ManyToOne(() => User, (user) => user.review)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  expertId: number;

  @ManyToOne(() => User, (user) => user.review)
  @JoinColumn({ name: 'expertId' })
  expert: User;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
