import mongoose from 'mongoose';
import User, { IUser, UserRole, UserStatus } from '@/models/User';
import AuditLog from '@/models/AuditLog';

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function getUsers(params: GetUsersParams) {
  const { page = 1, limit = 10, search, role, status } = params;
  
  const query: any = {};
  
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
  
  const [users, total] = await Promise.all([
    User.find(query)
      .populate('referredBy', 'name email referralCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password')
      .lean(),
    User.countDocuments(query)
  ]);
  
  const userIds = users.map(u => u._id);
  const directReferralCounts = await User.aggregate([
    { $match: { referredBy: { $in: userIds } } },
    { $group: { _id: '$referredBy', count: { $sum: 1 } } }
  ]);
  
  const countMap = new Map();
  directReferralCounts.forEach(c => countMap.set(c._id.toString(), c.count));
  
  const usersWithCounts = users.map(u => {
    // Ensure nested object serialization issues are resolved
    const uJSON = JSON.parse(JSON.stringify(u));
    return {
      ...uJSON,
      directReferralCount: countMap.get(u._id.toString()) || 0
    };
  });

  return {
    users: usersWithCounts,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}

export async function getUserById(id: string) {
  let query;
  if (mongoose.isValidObjectId(id)) {
    query = { _id: id };
  } else {
    query = { referralCode: id };
  }
  
  const user = await User.findOne(query)
    .populate('referredBy', 'name email referralCode')
    .select('-password')
    .lean();
    
  if (!user) return null;
  
  const directReferralCount = await User.countDocuments({ referredBy: user._id });
  
  // To get total network count, we can use $graphLookup
  const networkCountAggregate = await User.aggregate([
    { $match: { _id: user._id } },
    {
      $graphLookup: {
        from: 'users',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'referredBy',
        as: 'network'
      }
    },
    { $project: { networkCount: { $size: '$network' } } }
  ]);
  
  const networkCount = networkCountAggregate[0]?.networkCount || 0;
  
  const uJSON = JSON.parse(JSON.stringify(user));

  return {
    ...uJSON,
    directReferralCount,
    networkCount
  };
}

export async function updateUserStatus(
  targetUserId: string, 
  newStatus: UserStatus, 
  adminUserId: string,
  reason?: string
) {
  if (!mongoose.isValidObjectId(targetUserId)) throw new Error('Invalid user ID');
  if (!mongoose.isValidObjectId(adminUserId)) throw new Error('Invalid admin ID');
  
  if (!Object.values(UserStatus).includes(newStatus)) {
    throw new Error('Invalid status');
  }

  if (targetUserId === adminUserId && newStatus !== UserStatus.ACTIVE) {
    throw new Error('You cannot deactivate or block yourself');
  }
  
  const user = await User.findById(targetUserId);
  if (!user) throw new Error('User not found');
  
  const oldStatus = user.status;
  user.status = newStatus;
  
  if (reason) {
    user.statusRemark = reason;
  } else if (newStatus === UserStatus.ACTIVE) {
    user.statusRemark = '';
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    await user.save({ session });
    
    await AuditLog.create([{
      performedBy: adminUserId,
      action: `USER_${newStatus}`,
      entityType: 'User',
      entityId: user._id,
      description: `User status changed from ${oldStatus} to ${newStatus}${reason ? ` - ${reason}` : ''}`,
    }], { session });
    
    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function getAdminUserStats() {
  const [total, active, managers, members, blocked, inactive] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: UserStatus.ACTIVE }),
    User.countDocuments({ role: UserRole.MANAGER }),
    User.countDocuments({ role: UserRole.MEMBER }),
    User.countDocuments({ status: UserStatus.BLOCKED }),
    User.countDocuments({ status: UserStatus.INACTIVE }),
  ]);

  return { total, active, managers, members, blocked, inactive };
}
