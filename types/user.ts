export enum UserRole {
  ROOT_ADMIN = 'ROOT_ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export interface UserType {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  status: UserStatus;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  createdAt: Date;
  updatedAt: Date;
}
