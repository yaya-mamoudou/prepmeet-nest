import { User } from 'src/auth/entities/auth.entity';
import { VisibilityLevel } from 'src/utils/enum';
import {
  Column,
  Entity,
  JoinTable,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('expert-profile')
export class ExpertProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;
  @OneToOne(() => User)
  @JoinTable()
  user: User;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ nullable: true, default: VisibilityLevel.basicVisible })
  visibilityLevel: VisibilityLevel;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
