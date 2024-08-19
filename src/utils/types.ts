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

export const PAGINATION_PARAM = {
  sortableColumns: ['id', 'updatedDate', 'createdDate'],
};

export const FOCUS_AREA_PAGINATION_PARAM = {
  sortableColumns: ['id', 'FocusArea'],
};

export const EXPERT_PAGINATION_PARAM = {
  sortableColumns: ['id', 'updatedDate', 'createdDate'],
  searchableColumns: ['firstName', 'lastName'],
};
