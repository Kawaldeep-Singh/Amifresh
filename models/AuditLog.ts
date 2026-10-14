import crypto from 'crypto';
import { query, queryOne, execute } from '@/lib/mysql';

export interface IAuditLog {
  _id: string;
  id: string;
  performedBy: any;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

function rowToAuditLog(row: any): IAuditLog | null {
  if (!row) return null;
  let metadata = null;
  if (row.metadata) {
    try {
      metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
    } catch {
      metadata = row.metadata;
    }
  }

  const log: any = {
    ...row,
    _id: row.id,
    id: row.id,
    metadata,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
  };

  if (row.user_id) {
    log.performedBy = {
      _id: row.user_id,
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
    };
  }

  return log;
}

class AuditLogQueryChain implements PromiseLike<IAuditLog[]> {
  private filter: any;
  private sortOrder: string = 'ORDER BY a.createdAt DESC';
  private skipVal: number = 0;
  private limitVal?: number;

  constructor(filter?: any) {
    this.filter = filter || {};
  }

  populate(field: string, select?: string) {
    return this;
  }

  sort(s: any) {
    if (typeof s === 'object' && s) {
      const field = Object.keys(s)[0] || 'createdAt';
      const dir = s[field] === 1 ? 'ASC' : 'DESC';
      this.sortOrder = `ORDER BY a.${field} ${dir}`;
    }
    return this;
  }

  skip(n: number) {
    this.skipVal = n;
    return this;
  }

  limit(n: number) {
    this.limitVal = n;
    return this;
  }

  lean() {
    return this;
  }

  async exec(): Promise<IAuditLog[]> {
    const clauses: string[] = [];
    const params: any[] = [];

    if (this.filter.performedBy) {
      clauses.push('a.performedBy = ?');
      params.push(this.filter.performedBy);
    }
    if (this.filter.action) {
      clauses.push('a.action = ?');
      params.push(this.filter.action);
    }
    if (this.filter.entityType) {
      clauses.push('a.entityType = ?');
      params.push(this.filter.entityType);
    }

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    let sql = `
      SELECT a.*, u.id as user_id, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.performedBy = u.id
      ${whereSql}
      ${this.sortOrder}
    `;

    if (this.limitVal !== undefined) {
      sql += ` LIMIT ${Number(this.limitVal)} OFFSET ${Number(this.skipVal)}`;
    }

    const rows = await query<any>(sql, params);
    return rows.map(rowToAuditLog) as IAuditLog[];
  }

  then<TResult1 = IAuditLog[], TResult2 = never>(
    onfulfilled?: ((value: IAuditLog[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export const AuditLog = {
  find(filter?: any) {
    return new AuditLogQueryChain(filter);
  },

  async countDocuments(filter?: any) {
    const clauses: string[] = [];
    const params: any[] = [];

    if (filter?.performedBy) {
      clauses.push('performedBy = ?');
      params.push(filter.performedBy);
    }
    if (filter?.action) {
      clauses.push('action = ?');
      params.push(filter.action);
    }
    if (filter?.entityType) {
      clauses.push('entityType = ?');
      params.push(filter.entityType);
    }

    const whereSql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    const row = await queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM audit_logs ${whereSql}`, params);
    return Number(row?.count || 0);
  },

  async create(data: any | any[], opts?: any) {
    const items = Array.isArray(data) ? data : [data];
    const createdLogs: IAuditLog[] = [];

    for (const item of items) {
      const id = item.id || item._id || crypto.randomUUID();
      const meta = item.metadata ? JSON.stringify(item.metadata) : null;
      const performedBy = typeof item.performedBy === 'object' ? item.performedBy.toString() : item.performedBy;
      const entityId = item.entityId ? (typeof item.entityId === 'object' ? item.entityId.toString() : item.entityId) : null;

      await execute(
        `INSERT INTO audit_logs (id, performedBy, action, entityType, entityId, description, metadata, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, performedBy, item.action, item.entityType, entityId, item.description, meta]
      );

      createdLogs.push({
        _id: id,
        id,
        performedBy,
        action: item.action,
        entityType: item.entityType,
        entityId,
        description: item.description,
        metadata: item.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return Array.isArray(data) ? createdLogs : createdLogs[0];
  },
};

export default AuditLog;
