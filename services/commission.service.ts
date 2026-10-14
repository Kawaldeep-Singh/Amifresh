import crypto from 'crypto';
import { queryOne, execute, transaction } from '@/lib/mysql';

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export async function approveCommission(commissionId: string, adminId: string) {
  const commission = await queryOne<any>('SELECT * FROM commissions WHERE id = ?', [commissionId]);
  if (!commission) throw new Error('Commission not found');

  if (commission.status !== CommissionStatus.PENDING) {
    throw new Error(`Cannot approve commission with status ${commission.status}`);
  }

  await execute(
    'UPDATE commissions SET status = ?, approvedBy = ?, approvedAt = NOW(), updatedAt = NOW() WHERE id = ?',
    [CommissionStatus.APPROVED, adminId, commissionId]
  );

  const auditId = crypto.randomUUID();
  await execute(
    `INSERT INTO audit_logs (id, performedBy, action, entityType, entityId, description, createdAt, updatedAt)
     VALUES (?, ?, 'COMMISSION_APPROVED', 'Commission', ?, ?, NOW(), NOW())`,
    [auditId, adminId, commissionId, `Approved commission of ${commission.commissionAmount} for order ${commission.order}`]
  );

  return { ...commission, status: CommissionStatus.APPROVED };
}

export async function payCommission(commissionId: string, adminId: string) {
  return transaction(async (conn) => {
    const [rows]: any = await conn.execute('SELECT * FROM commissions WHERE id = ?', [commissionId]);
    const commission = rows && rows.length > 0 ? rows[0] : null;
    if (!commission) throw new Error('Commission not found');

    if (commission.status !== CommissionStatus.APPROVED) {
      throw new Error(`Commission must be APPROVED before payment. Current status: ${commission.status}`);
    }

    await conn.execute(
      'UPDATE commissions SET status = ?, paidBy = ?, paidAt = NOW(), updatedAt = NOW() WHERE id = ?',
      [CommissionStatus.PAID, adminId, commissionId]
    );

    await conn.execute(
      'UPDATE users SET totalCommission = totalCommission + ?, totalSales = totalSales + ?, updatedAt = NOW() WHERE id = ?',
      [Number(commission.commissionAmount), Number(commission.saleAmount), commission.user]
    );

    const auditId = crypto.randomUUID();
    await conn.execute(
      `INSERT INTO audit_logs (id, performedBy, action, entityType, entityId, description, createdAt, updatedAt)
       VALUES (?, ?, 'COMMISSION_PAID', 'Commission', ?, ?, NOW(), NOW())`,
      [auditId, adminId, commissionId, `Marked commission of ${commission.commissionAmount} as PAID for order ${commission.order}`]
    );

    return { ...commission, status: CommissionStatus.PAID };
  });
}
