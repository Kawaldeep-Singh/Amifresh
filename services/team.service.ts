import mongoose from 'mongoose';
import User, { IUser, UserRole, UserStatus } from '@/models/User';

export async function getManagerDownlineIds(managerId: string): Promise<string[]> {
  const result = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(managerId) } },
    {
      $graphLookup: {
        from: 'users',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'referredBy',
        as: 'network'
      }
    },
    { $project: { networkIds: '$network._id' } }
  ]);
  
  if (!result || result.length === 0 || !result[0].networkIds) return [];
  return result[0].networkIds.map((id: mongoose.Types.ObjectId) => id.toString());
}

export interface GetTeamParams {
  managerId: string;
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function getManagerTeam(params: GetTeamParams) {
  const { managerId, page = 1, limit = 10, search, role, status } = params;
  
  const downlineIds = await getManagerDownlineIds(managerId);
  
  if (downlineIds.length === 0) {
    return { team: [], total: 0, page, totalPages: 0 };
  }
  
  const query: any = { _id: { $in: downlineIds.map(id => new mongoose.Types.ObjectId(id)) } };
  
  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { referralCode: searchRegex }
    ];
  }
  
  if (role && Object.values(UserRole).includes(role as UserRole)) {
    query.role = role;
  }
  
  if (status && Object.values(UserStatus).includes(status as UserStatus)) {
    query.status = status;
  }
  
  const skip = (page - 1) * limit;
  
  const [team, total] = await Promise.all([
    User.find(query)
      .populate('referredBy', 'name email referralCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')
      .lean(),
    User.countDocuments(query)
  ]);
  
  const userIds = team.map(u => u._id);
  const directReferralCounts = await User.aggregate([
    { $match: { referredBy: { $in: userIds } } },
    { $group: { _id: '$referredBy', count: { $sum: 1 } } }
  ]);
  
  const countMap = new Map();
  directReferralCounts.forEach(c => countMap.set(c._id.toString(), c.count));
  
  const teamWithCounts = team.map(u => {
    const uJSON = JSON.parse(JSON.stringify(u));
    return {
      ...uJSON,
      directReferralCount: countMap.get(u._id.toString()) || 0
    };
  });

  return {
    team: teamWithCounts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getManagerTeamStats(managerId: string) {
  const downlineIds = await getManagerDownlineIds(managerId);
  
  if (downlineIds.length === 0) {
    return { total: 0, active: 0, inactive: 0, directReferrals: 0 };
  }
  
  const objectIds = downlineIds.map(id => new mongoose.Types.ObjectId(id));
  
  const [total, active, inactive, directReferrals] = await Promise.all([
    User.countDocuments({ _id: { $in: objectIds } }),
    User.countDocuments({ _id: { $in: objectIds }, status: UserStatus.ACTIVE }),
    User.countDocuments({ _id: { $in: objectIds }, status: { $ne: UserStatus.ACTIVE } }),
    User.countDocuments({ referredBy: new mongoose.Types.ObjectId(managerId) })
  ]);
  
  return { total, active, inactive, directReferrals };
}
