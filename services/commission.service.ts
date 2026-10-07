import mongoose from 'mongoose';
import Commission, { CommissionStatus } from '@/models/Commission';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import dbConnect from '@/lib/mongodb';

export async function approveCommission(commissionId: string, adminId: string) {
  await dbConnect();
  
  const commission = await Commission.findById(commissionId);
  if (!commission) throw new Error('Commission not found');
  
  if (commission.status !== CommissionStatus.PENDING) {
    throw new Error(`Cannot approve commission with status ${commission.status}`);
  }

  commission.status = CommissionStatus.APPROVED;
  commission.approvedBy = new mongoose.Types.ObjectId(adminId);
  commission.approvedAt = new Date();
  
  await commission.save();
  
  await AuditLog.create({
    performedBy: adminId,
    action: 'COMMISSION_APPROVED',
    entityType: 'Commission',
    entityId: commission._id,
    description: `Approved commission of ${commission.commissionAmount} for order ${commission.order}`,
  });
  
  return commission;
}

export async function payCommission(commissionId: string, adminId: string) {
  await dbConnect();
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const commission = await Commission.findById(commissionId).session(session);
    if (!commission) throw new Error('Commission not found');
    
    if (commission.status !== CommissionStatus.APPROVED) {
      throw new Error(`Commission must be APPROVED before payment. Current status: ${commission.status}`);
    }

    commission.status = CommissionStatus.PAID;
    commission.paidBy = new mongoose.Types.ObjectId(adminId);
    commission.paidAt = new Date();
    
    await commission.save({ session });

    // Update User's totals
    await User.findByIdAndUpdate(commission.user, {
      $inc: { 
        totalCommission: commission.commissionAmount,
        totalSales: commission.saleAmount
      }
    }, { session });

    await AuditLog.create([{
      performedBy: adminId,
      action: 'COMMISSION_PAID',
      entityType: 'Commission',
      entityId: commission._id,
      description: `Marked commission of ${commission.commissionAmount} as PAID for order ${commission.order}`,
    }], { session });

    await session.commitTransaction();
    session.endSession();
    
    return commission;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
