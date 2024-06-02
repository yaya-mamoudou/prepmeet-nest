import { User } from 'src/auth/entities/auth.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('certification')
export class Certification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'userId' })
  user: number;

  @Column()
  name: string;

  @Column()
  year: string;

  @Column()
  certificationUrl: string;
}
