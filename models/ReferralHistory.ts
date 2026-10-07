import mongoose, { Schema, Document } from 'mongoose';

export interface IReferralHistory extends Document {
  referrer: mongoose.Types.ObjectId;
  referredUser: mongoose.Types.ObjectId;
  referralCode: string;
  registrationDate: Date;
  approvalDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralHistorySchema: Schema = new Schema(
  {
    referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referredUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referralCode: { type: String, required: true },
    registrationDate: { type: Date, required: true, default: Date.now },
    approvalDate: { type: Date },
    status: { type: String, required: true, default: 'PENDING' },
  },
  { timestamps: true }
);

ReferralHistorySchema.index({ referrer: 1 });
ReferralHistorySchema.index({ referredUser: 1 });
ReferralHistorySchema.index({ referralCode: 1 });
ReferralHistorySchema.index({ createdAt: -1 });

export default mongoose.models.ReferralHistory || mongoose.model<IReferralHistory>('ReferralHistory', ReferralHistorySchema);
