import connectDB from '@/lib/mongodb';
import User, { UserRole, UserStatus } from '@/models/User';
import RegistrationRequest, { RegistrationStatus } from '@/models/RegistrationRequest';
import mongoose from 'mongoose';

export async function getAdminDashboardStats() {
  await connectDB();

  const results = await User.aggregate([
    {
      $facet: {
        totalUsers: [{ $count: 'count' }],
        activeSakhis: [
          { $match: { role: UserRole.SAKHI, status: UserStatus.ACTIVE } },
          { $count: 'count' },
        ],
        totalSakhis: [
          { $match: { role: UserRole.SAKHI } },
          { $count: 'count' },
        ],
        pendingRegistrations: [
          { $match: { status: UserStatus.PENDING } },
          { $count: 'count' },
        ],
        totalTeams: [
          { $match: { role: UserRole.TEAM, status: UserStatus.ACTIVE } },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const facet = results[0] || {};
  return {
    totalUsers: facet.totalUsers?.[0]?.count || 0,
    activeSakhis: facet.activeSakhis?.[0]?.count || 0,
    totalSakhis: facet.totalSakhis?.[0]?.count || 0,
    pendingRegistrations: facet.pendingRegistrations?.[0]?.count || 0,
    totalTeams: facet.totalTeams?.[0]?.count || 0,
  };
}

export async function getSakhiDashboardStats(userId: string) {
  await connectDB();

  // Find user to verify with lean query
  const user = await User.findById(userId).select('status totalCommission totalSales').lean();
  if (!user) throw new Error('User not found');

  // Direct referrals
  const directReferrals = await User.countDocuments({ referredBy: userId });

  // Indirect referrals
  const directReferralDocs = await User.find({ referredBy: userId }).select('_id').lean();
  const directReferralIds = directReferralDocs.map((doc: any) => doc._id);
  const indirectReferrals = directReferralIds.length > 0
    ? await User.countDocuments({ referredBy: { $in: directReferralIds } })
    : 0;

  return {
    directReferrals,
    indirectReferrals,
    totalNetwork: directReferrals + indirectReferrals,
    status: user.status,
    totalCommission: user.totalCommission || 0,
    totalSales: user.totalSales || 0,
  };
}
