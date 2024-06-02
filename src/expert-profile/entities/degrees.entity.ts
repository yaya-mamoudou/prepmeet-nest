import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExpertProfile } from './expert-profile.entity';
import { EducationalExperience } from './educational-experience.entity';

@Entity('degrees')
export class Degrees {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  degreeName: string;

  @OneToMany(
    () => EducationalExperience,
    (eduExperience) => eduExperience.degreeId,
  )
  educationalExperience: EducationalExperience[];
}
