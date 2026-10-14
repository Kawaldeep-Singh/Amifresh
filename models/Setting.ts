import crypto from 'crypto';
import { queryOne, execute } from '@/lib/mysql';

export interface ISetting {
  _id: string;
  id: string;
  key: string;
  value: any;
  description?: string;
  updatedBy: any;
  createdAt: Date;
  updatedAt: Date;
}

export const Setting = {
  async findOne(filter: { key: string }) {
    const row = await queryOne<any>('SELECT * FROM settings WHERE `key` = ? LIMIT 1', [filter.key]);
    if (!row) return null;
    let value = row.value;
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {
        // Keep string
      }
    }
    return {
      _id: row.id,
      id: row.id,
      key: row.key,
      value,
      description: row.description,
      updatedBy: row.updatedBy,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  },

  async create(data: any) {
    const id = data.id || data._id || crypto.randomUUID();
    const val = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
    const updatedBy = typeof data.updatedBy === 'object' ? data.updatedBy.toString() : data.updatedBy;

    await execute(
      'INSERT INTO settings (id, `key`, value, description, updatedBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [id, data.key, val, data.description || null, updatedBy]
    );

    return {
      _id: id,
      id,
      key: data.key,
      value: data.value,
      description: data.description,
      updatedBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },
};

export default Setting;
