export enum UserRole {
  client = 'client',
  expert = 'expert',
}

export enum Gender {
  male = 'male',
  female = 'female',
}

export enum VisibilityLevel {
  notVisible = 'not-visible',
  basicVisible = 'basic-visible',
  completelyVisible = 'completely-visible',
}

export enum VerificationCodeType {
  forgotPassword = 'forgot-password',
  emailVerification = 'email-verification',
}

export enum SocialAuthenticationParam {
  google = 'google',
  facebook = 'facebook',
}

export enum SessionStatus {
  pending = 'PENDING',
  success = 'SUCCESS',
  booked = 'BOOKED',
  canceled = 'CANCELED',
  upcoming = 'UPCOMING',
  expired = 'EXPIRED',
}

export enum StripePaymentStatus {
  expired = 'expired',
  complete = 'complete',
  open = 'open',
  paid = 'paid',
  unpaid = 'unpaid',
}
