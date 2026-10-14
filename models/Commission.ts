import crypto from 'crypto';
import { queryOne, execute } from '@/lib/mysql';

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  REVERSED = 'REVERSED',
}

export interface ICommission {
  _id: string;
  id: string;
  user: any;
  order: any;
  saleAmount: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  approvedBy?: any;
  paidBy?: any;
  approvedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const Commission = {
  async findById(id: string) {
    const row = await queryOne<any>('SELECT * FROM commissions WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;
    return {
      ...row,
      _id: row.id,
      id: row.id,
      saleAmount: Number(row.saleAmount || 0),
      commissionRate: Number(row.commissionRate || 0),
      commissionAmount: Number(row.commissionAmount || 0),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  },

  async create(data: any | any[], opts?: any) {
    const items = Array.isArray(data) ? data : [data];
    const results: ICommission[] = [];

    for (const item of items) {
      const id = item.id || item._id || crypto.randomUUID();
      const user = typeof item.user === 'object' ? item.user.toString() : item.user;
      const order = typeof item.order === 'object' ? item.order.toString() : item.order;

      await execute(
        `INSERT INTO commissions (id, user, \`order\`, saleAmount, commissionRate, commissionAmount, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          user,
          order,
          Number(item.saleAmount || 0),
          Number(item.commissionRate || 0),
          Number(item.commissionAmount || 0),
          item.status || CommissionStatus.PENDING,
        ]
      );

      results.push({
        _id: id,
        id,
        user,
        order,
        saleAmount: Number(item.saleAmount || 0),
        commissionRate: Number(item.commissionRate || 0),
        commissionAmount: Number(item.commissionAmount || 0),
        status: item.status || CommissionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return Array.isArray(data) ? results : results[0];
  },
};

export default Commission;
