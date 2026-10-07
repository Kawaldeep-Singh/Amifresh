import mongoose, { Schema, Document } from 'mongoose';

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

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId | IUser;
  status: UserStatus;
  statusRemark?: string;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.MEMBER, index: true },
    referralCode: { type: String, required: true, unique: true, index: true },
    referredBy: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.PENDING, index: true },
    statusRemark: { type: String },
    commissionRate: { type: Number, default: 35 },
    totalSales: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.index({ createdAt: -1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
