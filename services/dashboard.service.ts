import { queryOne } from '@/lib/mysql';

export async function getAdminDashboardStats() {
  const row = await queryOne<any>(`
    SELECT
      COUNT(*) as totalUsers,
      COALESCE(SUM(CASE WHEN role = 'SAKHI' AND status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as activeSakhis,
      COALESCE(SUM(CASE WHEN role = 'SAKHI' THEN 1 ELSE 0 END), 0) as totalSakhis,
      COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pendingRegistrations,
      COALESCE(SUM(CASE WHEN role = 'TEAM' AND status = 'ACTIVE' THEN 1 ELSE 0 END), 0) as totalTeams
    FROM users
  `);

  return {
    totalUsers: Number(row?.totalUsers || 0),
    activeSakhis: Number(row?.activeSakhis || 0),
    totalSakhis: Number(row?.totalSakhis || 0),
    pendingRegistrations: Number(row?.pendingRegistrations || 0),
    totalTeams: Number(row?.totalTeams || 0),
  };
}

export async function getSakhiDashboardStats(userId: string) {
  const user = await queryOne<any>(
    'SELECT id, status, totalCommission, totalSales FROM users WHERE id = ?',
    [userId]
  );
  if (!user) throw new Error('User not found');

  const dirRow = await queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM users WHERE referredBy = ?',
    [userId]
  );
  const directReferrals = Number(dirRow?.count || 0);

  const indRow = await queryOne<{ count: number }>(
    `SELECT COUNT(*) as count FROM users WHERE referredBy IN (
      SELECT id FROM users WHERE referredBy = ?
    )`,
    [userId]
  );
  const indirectReferrals = Number(indRow?.count || 0);

  return {
    directReferrals,
    indirectReferrals,
    totalNetwork: directReferrals + indirectReferrals,
    status: user.status,
    totalCommission: Number(user.totalCommission || 0),
    totalSales: Number(user.totalSales || 0),
  };
}
