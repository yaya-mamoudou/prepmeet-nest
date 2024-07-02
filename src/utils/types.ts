import { UserRole } from './enum';

export type JwtContent = {
  uid: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

export type Slots = {
  from: string;
  to: string;
  availability: 'AVAILABLE' | 'NOT_AVAILABLE';
  slotId?: number;
  meetingDate?: Date;
};

export const DaysArray = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];
