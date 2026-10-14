import crypto from 'crypto';
import { query, queryOne, execute, transaction } from '@/lib/mysql';
import { UserRole, UserStatus } from '@/types/user';

export { UserRole, UserStatus };

export interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function getUsers(params: GetUsersParams) {
  const { page = 1, limit = 10, search, role, status } = params;
  const whereClauses: string[] = [];
  const sqlParams: any[] = [];

  if (search) {
    const term = `%${search.trim()}%`;
    whereClauses.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR u.referralCode LIKE ?)');
    sqlParams.push(term, term, term, term);
  }

  if (role && Object.values(UserRole).includes(role as UserRole)) {
    whereClauses.push('u.role = ?');
    sqlParams.push(role);
  }

  if (status && Object.values(UserStatus).includes(status as UserStatus)) {
    whereClauses.push('u.status = ?');
    sqlParams.push(status);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const skip = (page - 1) * limit;

  // Total count
  const countRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) as total FROM users u ${whereSql}`,
    [...sqlParams]
  );
  const total = Number(countRow?.total || 0);

  // Users with referredBy join and direct referral count
  const rows = await query<any>(
    `SELECT 
      u.*,
      r.id as ref_id,
      r.name as ref_name,
      r.email as ref_email,
      r.referralCode as ref_referralCode,
      (SELECT COUNT(*) FROM users d WHERE d.referredBy = u.id) as directReferralCount
    FROM users u
    LEFT JOIN users r ON u.referredBy = r.id
    ${whereSql}
    ORDER BY u.createdAt DESC
    LIMIT ? OFFSET ?`,
    [...sqlParams, Number(limit), Number(skip)]
  );

  const users = rows.map((r) => {
    const user: any = {
      ...r,
      _id: r.id,
      directReferralCount: Number(r.directReferralCount || 0),
    };
    if (r.ref_id) {
      user.referredBy = {
        _id: r.ref_id,
        id: r.ref_id,
        name: r.ref_name,
        email: r.ref_email,
        referralCode: r.ref_referralCode,
      };
    } else {
      user.referredBy = null;
    }
    delete user.ref_id;
    delete user.ref_name;
    delete user.ref_email;
    delete user.ref_referralCode;
    delete user.password;
    return user;
  });

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUserById(id: string) {
  const row = await queryOne<any>(
    `SELECT 
      u.*,
      r.id as ref_id,
      r.name as ref_name,
      r.email as ref_email,
      r.referralCode as ref_referralCode,
      (SELECT COUNT(*) FROM users d WHERE d.referredBy = u.id) as directReferralCount
    FROM users u
    LEFT JOIN users r ON u.referredBy = r.id
    WHERE u.id = ? OR u.referralCode = ?
    LIMIT 1`,
    [id, id]
  );

  if (!row) return null;

  // Calculate complete multilevel network count using recursive CTE
  let networkCount = 0;
  try {
    const netRow = await queryOne<{ count: number }>(
      `WITH RECURSIVE downline AS (
        SELECT id FROM users WHERE referredBy = ?
        UNION ALL
        SELECT u.id FROM users u INNER JOIN downline d ON u.referredBy = d.id
      )
      SELECT COUNT(*) as count FROM downline`,
      [row.id]
    );
    networkCount = Number(netRow?.count || 0);
  } catch {
    networkCount = Number(row.directReferralCount || 0);
  }

  const user: any = {
    ...row,
    _id: row.id,
    directReferralCount: Number(row.directReferralCount || 0),
    networkCount,
  };

  if (row.ref_id) {
    user.referredBy = {
      _id: row.ref_id,
      id: row.ref_id,
      name: row.ref_name,
      email: row.ref_email,
      referralCode: row.ref_referralCode,
    };
  } else {
    user.referredBy = null;
  }

  delete user.ref_id;
  delete user.ref_name;
  delete user.ref_email;
  delete user.ref_referralCode;
  delete user.password;

  return user;
}

export async function updateUserStatus(
  targetUserId: string,
  newStatus: UserStatus,
  adminUserId: string,
  reason?: string
) {
  if (!targetUserId) throw new Error('Invalid user ID');
  if (!adminUserId) throw new Error('Invalid admin ID');

  if (!Object.values(UserStatus).includes(newStatus)) {
    throw new Error('Invalid status');
  }

  if (targetUserId === adminUserId && newStatus !== UserStatus.ACTIVE) {
    throw new Error('You cannot deactivate or block yourself');
  }

  const user = await queryOne<any>('SELECT * FROM users WHERE id = ?', [targetUserId]);
  if (!user) throw new Error('User not found');

  const oldStatus = user.status;
  const statusRemark = reason ? reason : newStatus === UserStatus.ACTIVE ? '' : user.statusRemark;

  await transaction(async (conn) => {
    await conn.execute(
      'UPDATE users SET status = ?, statusRemark = ?, updatedAt = NOW() WHERE id = ?',
      [newStatus, statusRemark, targetUserId]
    );

    const auditId = crypto.randomUUID();
    const desc = `User status changed from ${oldStatus} to ${newStatus}${reason ? ` - ${reason}` : ''}`;
    await conn.execute(
      `INSERT INTO audit_logs (id, performedBy, action, entityType, entityId, description, createdAt, updatedAt)
       VALUES (?, ?, ?, 'User', ?, ?, NOW(), NOW())`,
      [auditId, adminUserId, `USER_${newStatus}`, targetUserId, desc]
    );
  });

  return true;
}

export async function getAdminUserStats() {
  const row = await queryOne<any>(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
      COALESCE(SUM(CASE WHEN role = 'TEAM' THEN 1 ELSE 0 END), 0) as teams,
      COALESCE(SUM(CASE WHEN role = 'SAKHI' THEN 1 ELSE 0 END), 0) as sakhis,
      COALESCE(SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END), 0) as blocked,
      COALESCE(SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END), 0) as inactive,
      COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pending
    FROM users
  `);

  return {
    total: Number(row?.total || 0),
    active: Number(row?.active || 0),
    teams: Number(row?.teams || 0),
    sakhis: Number(row?.sakhis || 0),
    blocked: Number(row?.blocked || 0),
    inactive: Number(row?.inactive || 0),
    pending: Number(row?.pending || 0),
  };
}

export async function getEmployeeStats() {
  const row = await queryOne<any>(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
      COALESCE(SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END), 0) as inactive,
      COALESCE(SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END), 0) as blocked
    FROM users WHERE role = 'TEAM'
  `);

  return {
    total: Number(row?.total || 0),
    active: Number(row?.active || 0),
    inactive: Number(row?.inactive || 0),
    blocked: Number(row?.blocked || 0),
  };
}

export async function getSakhiStats() {
  const row = await queryOne<any>(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
      COALESCE(SUM(CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END), 0) as inactive,
      COALESCE(SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END), 0) as blocked,
      COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pending
    FROM users WHERE role = 'SAKHI'
  `);

  return {
    total: Number(row?.total || 0),
    active: Number(row?.active || 0),
    inactive: Number(row?.inactive || 0),
    blocked: Number(row?.blocked || 0),
    pending: Number(row?.pending || 0),
  };
}
