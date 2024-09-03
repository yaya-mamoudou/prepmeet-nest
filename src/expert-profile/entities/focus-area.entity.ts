import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { UserFocusArea } from './user-focus-area.entity';

@Entity('focus-area')
export class FocusArea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  FocusArea: string;

  @OneToMany(() => UserFocusArea, (expert) => expert.focusAreaId)
  profile: UserFocusArea;
}
