import mongoose from 'mongoose';
import User, { IUser, UserStatus } from '@/models/User';
import ReferralHistory from '@/models/ReferralHistory';
import RegistrationRequest from '@/models/RegistrationRequest';

export async function validateReferralCode(code: string): Promise<boolean> {
  if (!code) return false;
  const user = await User.findOne({ referralCode: code, status: UserStatus.ACTIVE });
  return !!user;
}

export async function getReferrerByCode(code: string): Promise<IUser | null> {
  if (!code) return null;
  return User.findOne({ referralCode: code, status: UserStatus.ACTIVE });
}

export async function getDirectReferrals(userId: string | mongoose.Types.ObjectId): Promise<IUser[]> {
  return User.find({ referredBy: userId }).select('-password');
}

export async function createReferralHistory(data: {
  referrer: mongoose.Types.ObjectId;
  referredUser: mongoose.Types.ObjectId;
  referralCode: string;
  status?: string;
  session?: mongoose.mongo.ClientSession;
}) {
  const { referrer, referredUser, referralCode, status = 'APPROVED', session } = data;
  
  const history = new ReferralHistory({
    referrer,
    referredUser,
    referralCode,
    status,
    approvalDate: new Date(),
  });

  return history.save({ session });
}

export async function generateUniqueReferralCode(name: string): Promise<string> {
  const baseCode = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
  const paddedBase = baseCode.padEnd(4, 'X');
  
  let isUnique = false;
  let code = '';
  
  while (!isUnique) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    code = `${paddedBase}${randomDigits}`;
    
    const existingUser = await User.findOne({ referralCode: code });
    const existingReq = await RegistrationRequest.findOne({ referralCode: code });
    if (!existingUser && !existingReq) {
      isUnique = true;
    }
  }
  
  return code;
}
