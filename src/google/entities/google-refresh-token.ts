import { User } from 'src/auth/entities/auth.entity';
import { VisibilityLevel } from 'src/utils/enum';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('google-refresh-token')
export class GoogleRefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  refreshToken: string;

  @Column({ nullable: true })
  createdDate: Date;

  @Column({ nullable: true })
  updatedDate: Date;
}
