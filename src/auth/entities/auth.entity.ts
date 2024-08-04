import { Certification } from 'src/expert-profile/entities/certification.entity';
import { EducationalExperience } from 'src/expert-profile/entities/educational-experience.entity';
import { ExpertProfile } from 'src/expert-profile/entities/expert-profile.entity';
import { Conversation } from 'src/messages/entity/conversation.entity';
import { Message } from 'src/messages/entity/message.entity';
import { Review } from 'src/review/entities/review.entity';
import { Availability } from 'src/session/entities/availability';
import { Session } from 'src/session/entities/session.entity';
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

  @Column({ nullable: true })
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

  @OneToMany(() => Certification, (certification) => certification.userId)
  certificationId: Certification[];

  @OneToMany(() => Conversation, (conv) => conv.initiatorId)
  initiator: Conversation[];

  @OneToMany(() => Conversation, (conv) => conv.initiatorWithUserId)
  initiatorWithUser: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  sender: Message[];

  @OneToMany(() => Message, (msg) => msg.receiver)
  receiver: Message[];

  @OneToMany(() => Session, (session) => session.expert)
  sessionExpert: Session[];

  @OneToMany(() => Session, (session) => session.client)
  sessionClient: Session[];

  @OneToMany(() => Availability, (availability) => availability.expert)
  clientBooking: Availability[];

  @OneToMany(() => Review, (review) => review.reviewer)
  review: Review[];

  @OneToMany(() => Review, (review) => review.expert)
  expert: Review[];
}
