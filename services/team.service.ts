import { query, queryOne } from '@/lib/mysql';
import { UserRole, UserStatus } from '@/types/user';

export async function getTeamDownlineIds(teamId: string): Promise<string[]> {
  try {
    const rows = await query<{ id: string }>(
      `WITH RECURSIVE downline AS (
        SELECT id FROM users WHERE referredBy = ?
        UNION ALL
        SELECT u.id FROM users u INNER JOIN downline d ON u.referredBy = d.id
      )
      SELECT id FROM downline`,
      [teamId]
    );
    return rows.map((r) => r.id);
  } catch {
    // Fallback to direct referrals if recursive CTE fails
    const rows = await query<{ id: string }>(
      'SELECT id FROM users WHERE referredBy = ?',
      [teamId]
    );
    return rows.map((r) => r.id);
  }
}

export interface GetTeamParams {
  teamId: string;
  downlineIds?: string[];
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}

export async function getTeamTeam(params: GetTeamParams) {
  const { teamId, page = 1, limit = 10, search, role, status } = params;
  const downlineIds = params.downlineIds || (await getTeamDownlineIds(teamId));

  if (downlineIds.length === 0) {
    return { team: [], total: 0, page, totalPages: 0 };
  }

  const whereClauses: string[] = ['u.id IN (?)'];
  const sqlParams: any[] = [downlineIds];

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

  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
  const skip = (page - 1) * limit;

  const countRow = await queryOne<{ total: number }>(
    `SELECT COUNT(*) as total FROM users u ${whereSql}`,
    [...sqlParams]
  );
  const total = Number(countRow?.total || 0);

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

  const team = rows.map((r) => {
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
    team,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTeamTeamStats(teamId: string, cachedDownlineIds?: string[]) {
  const downlineIds = cachedDownlineIds || (await getTeamDownlineIds(teamId));

  if (downlineIds.length === 0) {
    return { total: 0, active: 0, inactive: 0, directReferrals: 0 };
  }

  const statsRow = await queryOne<any>(
    `SELECT
      COUNT(*) as total,
      COALESCE(SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as active,
      COALESCE(SUM(CASE WHEN status != 'ACTIVE' THEN 1 ELSE 0 END), 0) as inactive
    FROM users WHERE id IN (?)`,
    [downlineIds]
  );

  const dirRow = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM users WHERE referredBy = ?',
    [teamId]
  );

  return {
    total: Number(statsRow?.total || 0),
    active: Number(statsRow?.active || 0),
    inactive: Number(statsRow?.inactive || 0),
    directReferrals: Number(dirRow?.count || 0),
  };
}
