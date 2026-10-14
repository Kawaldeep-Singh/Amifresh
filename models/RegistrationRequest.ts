export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IRegistrationRequest {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  fatherSpouseName?: string;
  photo?: string;
  panCard?: string;
  aadhaarCard?: string;
  aadhaarCardFront?: string;
  aadhaarCardBack?: string;
  passwordHash?: string;
  referralCode?: string;
  referrer?: any;
  status: RegistrationStatus;
  rejectionReason?: string;
  reviewedBy?: any;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const RegistrationRequest = {
  async findOne() {
    return null;
  },
  async find() {
    return [];
  },
  async create(data: any) {
    return { ...data, id: 'req-' + Date.now() };
  },
};

export default RegistrationRequest;
