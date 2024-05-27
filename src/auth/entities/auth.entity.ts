import { ApiProperty } from '@nestjs/swagger';
import { Gender, UserRole } from 'src/utils/enum';
import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('User')
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
}
