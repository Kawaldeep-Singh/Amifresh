import connectDB from '@/lib/mongodb';
import User, { UserRole, UserStatus } from '@/models/User';
import RegistrationRequest, { RegistrationStatus } from '@/models/RegistrationRequest';
import mongoose from 'mongoose';

export async function getAdminDashboardStats() {
  await connectDB();

  const [
    totalUsers,
    activeSakhis,
    totalSakhis,
    pendingRegistrations,
    totalTeams
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: UserRole.SAKHI, status: UserStatus.ACTIVE }),
    User.countDocuments({ role: UserRole.SAKHI }),
    User.countDocuments({ status: UserStatus.PENDING }),
    User.countDocuments({ role: UserRole.TEAM, status: UserStatus.ACTIVE }),
  ]);

  return {
    totalUsers,
    activeSakhis,
    totalSakhis,
    pendingRegistrations,
    totalTeams,
  };
}

export async function getSakhiDashboardStats(userId: string) {
  await connectDB();

  // Find user to verify
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Direct referrals
  const directReferrals = await User.countDocuments({ referredBy: userId });

  // Indirect referrals (level 2) - For a full tree we'd use $graphLookup, but for quick stats let's do a simple count
  // We can just get direct referrals IDs and then count their referrals
  const directReferralDocs = await User.find({ referredBy: userId }).select('_id');
  const directReferralIds = directReferralDocs.map(doc => doc._id);
  const indirectReferrals = await User.countDocuments({ referredBy: { $in: directReferralIds } });

  // For total network size, we can either do full graphLookup or just sum direct + indirect for now
  // Since Phase 4 has a full tree API, we can use a simpler stat here.
  
  return {
    directReferrals,
    indirectReferrals,
    totalNetwork: directReferrals + indirectReferrals,
    status: user.status,
    totalCommission: user.totalCommission,
    totalSales: user.totalSales,
  };
}
