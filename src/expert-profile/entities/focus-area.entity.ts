import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';

@Entity('focus-area')
export class FocusArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  FocusArea: string;

  @OneToMany(() => ExpertProfile, (expert) => expert.focusAreaId)
  profile: ExpertProfile;
}
