import mongoose, { Schema, Document } from 'mongoose';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface IRegistrationRequest extends Document {
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
  passwordHash?: string;
  referralCode?: string;
  referrer?: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  rejectionReason?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationRequestSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
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
    passwordHash: { type: String, required: false },
    referralCode: { type: String },
    referrer: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: Object.values(RegistrationStatus), default: RegistrationStatus.PENDING },
    rejectionReason: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

RegistrationRequestSchema.index({ email: 1 });
RegistrationRequestSchema.index({ phone: 1 });
RegistrationRequestSchema.index({ referralCode: 1 });
RegistrationRequestSchema.index({ status: 1 });
RegistrationRequestSchema.index({ createdAt: -1 });

export default mongoose.models.RegistrationRequest || mongoose.model<IRegistrationRequest>('RegistrationRequest', RegistrationRequestSchema);
