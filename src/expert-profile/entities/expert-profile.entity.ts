import { User } from 'src/auth/entities/auth.entity';
import { VisibilityLevel } from 'src/utils/enum';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FocusArea } from './focus-area.entity';

@Entity('expert-profile')
export class ExpertProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  userId: number;

  @Column({ nullable: true })
  focusAreaId: number;

  @OneToOne(() => FocusArea, (focusArea) => focusArea.profile)
  @JoinColumn({ name: 'focusAreaId' })
  focusArea: FocusArea;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true, default: VisibilityLevel.basicVisible })
  visibilityLevel: VisibilityLevel;

  @Column({ nullable: true })
  starterPrice: number;

  @Column({ nullable: true })
  recommendedPrice: number;

  @Column({ nullable: true })
  bestPrice: number;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
