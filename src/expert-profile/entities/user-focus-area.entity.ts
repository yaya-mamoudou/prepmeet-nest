import { User } from 'src/auth/entities/auth.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Degrees } from './degrees.entity';
import { FocusArea } from './focus-area.entity';

@Entity('user-focus-area')
export class UserFocusArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: number;

  @Column({ nullable: true })
  focusAreaId: number;

  @ManyToOne(() => FocusArea, (focusArea) => focusArea.profile)
  @JoinColumn({ name: 'focusAreaId' })
  focusArea: FocusArea;
}
