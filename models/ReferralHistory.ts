import crypto from 'crypto';
import { query, execute } from '@/lib/mysql';

export interface IReferralHistory {
  _id: string;
  id: string;
  referrer: any;
  referredUser: any;
  referralCode: string;
  registrationDate: Date;
  approvalDate?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ReferralHistory = {
  async create(data: any | any[], opts?: any) {
    const items = Array.isArray(data) ? data : [data];
    const results: IReferralHistory[] = [];

    for (const item of items) {
      const id = item.id || item._id || crypto.randomUUID();
      const referrer = typeof item.referrer === 'object' ? item.referrer.toString() : item.referrer;
      const referredUser = typeof item.referredUser === 'object' ? item.referredUser.toString() : item.referredUser;

      await execute(
        `INSERT INTO referral_histories (id, referrer, referredUser, referralCode, registrationDate, approvalDate, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())`,
        [id, referrer, referredUser, item.referralCode, item.registrationDate || new Date(), item.status || 'PENDING']
      );

      results.push({
        _id: id,
        id,
        referrer,
        referredUser,
        referralCode: item.referralCode,
        registrationDate: item.registrationDate || new Date(),
        approvalDate: new Date(),
        status: item.status || 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return Array.isArray(data) ? results : results[0];
  },
};

export default ReferralHistory;
