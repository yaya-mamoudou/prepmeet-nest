import { EducationalExperience } from 'src/expert-profile/entities/educational-experience.entity';
import { ExpertProfile } from 'src/expert-profile/entities/expert-profile.entity';
import { Gender, UserRole } from 'src/utils/enum';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, default: UserRole.client })
  role: UserRole;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true, default: false })
  emailVerified: boolean;

  @Column()
  password: string;

  @Column()
  hasAcceptedTerms: boolean;

  @Column({ nullable: true })
  hasedRefreshToken: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  profilePhoto: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;

  @OneToOne(() => ExpertProfile, (expert) => expert.userId)
  profile: ExpertProfile;

  @OneToMany(() => EducationalExperience, (eduExp) => eduExp.userId)
  educationalExperience: EducationalExperience[];
}
