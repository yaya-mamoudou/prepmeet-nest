import { VerificationCodeType } from 'src/utils/enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('verification-email')
export class VerificationEmail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  type: VerificationCodeType;

  @Column()
  email: string;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ default: false })
  verified: boolean;
}
