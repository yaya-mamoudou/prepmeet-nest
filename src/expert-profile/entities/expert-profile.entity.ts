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
import { Slots } from 'src/utils/types';

@Entity('expert-profile')
export class ExpertProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: User;

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
  starterPriceUrl: string;

  @Column({ nullable: true })
  recommendedPriceUrl: string;

  @Column({ nullable: true })
  bestPriceUrl: string;

  @Column({ nullable: true })
  doesUserHasCloudOrDevopsCertification: boolean;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
