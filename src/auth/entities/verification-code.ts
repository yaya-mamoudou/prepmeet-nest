import { VerificationCodeType } from 'src/utils/enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('verification-code')
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: number;

  @Column()
  type: VerificationCodeType;

  @Column()
  email: string;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ default: false })
  verified: boolean;
}
