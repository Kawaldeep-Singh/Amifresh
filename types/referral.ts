export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface ReferralHistoryType {
  _id: string;
  referrer: string;
  referredUser: string;
  referralCode: string;
  registrationDate: Date;
  approvalDate?: Date;
  status: ReferralStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegistrationRequestType {
  _id: string;
  user: string;
  referralCodeUsed: string;
  referrer?: string;
  status: RegistrationStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
