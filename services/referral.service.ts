import crypto from 'crypto';
import { query, queryOne, execute } from '@/lib/mysql';

export async function validateReferralCode(code: string): Promise<boolean> {
  if (!code) return false;
  const user = await queryOne<{ id: string }>(
    "SELECT id FROM users WHERE referralCode = ? AND status = 'ACTIVE' LIMIT 1",
    [code.trim()]
  );
  return !!user;
}

export async function getReferrerByCode(code: string): Promise<any | null> {
  if (!code) return null;
  const user = await queryOne<any>(
    "SELECT id, id as _id, name, email, phone, role, status, referralCode FROM users WHERE referralCode = ? AND status = 'ACTIVE' LIMIT 1",
    [code.trim()]
  );
  return user;
}

export async function getDirectReferrals(userId: string): Promise<any[]> {
  const rows = await query<any>(
    'SELECT id, id as _id, name, email, phone, role, referralCode, status, createdAt FROM users WHERE referredBy = ? ORDER BY createdAt DESC',
    [userId]
  );
  return rows;
}

export async function createReferralHistory(data: {
  referrer: string;
  referredUser: string;
  referralCode: string;
  status?: string;
}) {
  const { referrer, referredUser, referralCode, status = 'APPROVED' } = data;
  const id = crypto.randomUUID();

  await execute(
    `INSERT INTO referral_histories (id, referrer, referredUser, referralCode, status, approvalDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
    [id, referrer, referredUser, referralCode, status]
  );

  return { id, referrer, referredUser, referralCode, status };
}

export async function generateUniqueReferralCode(name: string): Promise<string> {
  const baseCode = (name || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
  const paddedBase = baseCode.padEnd(4, 'X');

  let isUnique = false;
  let code = '';

  while (!isUnique) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    code = `${paddedBase}${randomDigits}`;

    const existingUser = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE referralCode = ? LIMIT 1',
      [code]
    );
    if (!existingUser) {
      isUnique = true;
    }
  }

  return code;
}
