import mongoose, { Schema, Document } from 'mongoose';

export enum UserRole {
  ROOT_ADMIN = 'ROOT_ADMIN',
  TEAM = 'TEAM',
  SAKHI = 'SAKHI',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  loginId?: string;
  mustChangePassword?: boolean;
  role: UserRole;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId | IUser;
  status: UserStatus;
  statusRemark?: string;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
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
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, select: false },
    loginId: { type: String, unique: true, sparse: true, index: true },
    mustChangePassword: { type: Boolean, default: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.SAKHI, index: true },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING, index: true },
    statusRemark: { type: String },
    commissionRate: { type: Number, default: 35 },
    totalSales: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pinCode: { type: String },
    fatherSpouseName: { type: String },
    photo: { type: String },
    panCard: { type: String },
    aadhaarCard: { type: String },
  },
  { timestamps: true }
);

UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
