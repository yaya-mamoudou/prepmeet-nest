import { User } from 'src/auth/entities/auth.entity';
import { VisibilityLevel } from 'src/utils/enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Degrees } from './degrees.entity';

@Entity('educational-experience')
export class EducationalExperience {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  year: string;

  @Column({ nullable: true })
  degreeId: number;

  @ManyToOne(() => Degrees, (degree) => degree.educationalExperience)
  @JoinColumn({ name: 'degreeId' })
  degree: Degrees;
}
