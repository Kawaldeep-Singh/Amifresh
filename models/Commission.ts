import mongoose, { Schema, Document } from 'mongoose';

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export interface ICommission extends Document {
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  approvedBy?: mongoose.Types.ObjectId;
  paidBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    saleAmount: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(CommissionStatus), default: CommissionStatus.PENDING },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

CommissionSchema.index({ user: 1 });
CommissionSchema.index({ order: 1 });
CommissionSchema.index({ status: 1 });
CommissionSchema.index({ createdAt: -1 });

export default mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);
