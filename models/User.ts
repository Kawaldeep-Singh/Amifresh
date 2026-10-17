import crypto from 'crypto';
import { query, queryOne, execute, transaction } from '@/lib/mysql';

export enum UserRole {
  ROOT_ADMIN = 'ROOT_ADMIN',
  TEAM = 'TEAM',
  SAKHI = 'SAKHI',
}

export enum UserStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export interface IUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  loginId?: string;
  mustChangePassword?: boolean;
  role: UserRole;
  referralCode: string;
  referredBy?: any;
  status: UserStatus;
  statusRemark?: string;
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  fatherSpouseName?: string;
  photo?: string;
  panCard?: string;
  aadhaarCard?: string;
  aadhaarCardFront?: string;
  aadhaarCardBack?: string;
  createdAt: Date;
  updatedAt: Date;
  save: (opts?: any) => Promise<IUser>;
}

function rowToUser(row: any): IUser | null {
  if (!row) return null;
  const user: any = {
    ...row,
    _id: row.id,
    id: row.id,
    mustChangePassword: Boolean(row.mustChangePassword),
    commissionRate: Number(row.commissionRate || 0),
    totalSales: Number(row.totalSales || 0),
    totalCommission: Number(row.totalCommission || 0),
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
  };

  if (row.ref_id) {
    user.referredBy = {
      _id: row.ref_id,
      id: row.ref_id,
      name: row.ref_name,
      email: row.ref_email,
      referralCode: row.ref_referralCode,
    };
    delete user.ref_id;
    delete user.ref_name;
    delete user.ref_email;
    delete user.ref_referralCode;
  }

  user.save = async function (opts?: any) {
    await execute(
      `UPDATE users SET
        name = ?, email = ?, phone = ?, password = ?, loginId = ?,
        mustChangePassword = ?, role = ?, referralCode = ?, referredBy = ?,
        status = ?, statusRemark = ?, commissionRate = ?, totalSales = ?,
        totalCommission = ?, dob = ?, gender = ?, address = ?, city = ?,
        state = ?, pinCode = ?, fatherSpouseName = ?, photo = ?,
        panCard = ?, aadhaarCard = ?, aadhaarCardFront = ?, aadhaarCardBack = ?,
        updatedAt = NOW()
       WHERE id = ?`,
      [
        user.name,
        user.email,
        user.phone,
        user.password || null,
        user.loginId || null,
        user.mustChangePassword ? 1 : 0,
        user.role,
        user.referralCode,
        typeof user.referredBy === 'object' && user.referredBy ? user.referredBy.id || user.referredBy._id : user.referredBy || null,
        user.status,
        user.statusRemark || null,
        user.commissionRate,
        user.totalSales,
        user.totalCommission,
        user.dob || null,
        user.gender || null,
        user.address || null,
        user.city || null,
        user.state || null,
        user.pinCode || null,
        user.fatherSpouseName || null,
        user.photo || null,
        user.panCard || null,
        user.aadhaarCard || null,
        user.aadhaarCardFront || null,
        user.aadhaarCardBack || null,
        user.id,
      ]
    );
    return user;
  };

  return user;
}

class UserQueryChain implements PromiseLike<IUser[]> {
  private filter: any;
  private sortOrder: string = 'ORDER BY u.createdAt DESC';
  private skipVal: number = 0;
  private limitVal?: number;
  private doPopulate: boolean = false;
  private stripPassword: boolean = false;

  constructor(filter?: any) {
    this.filter = filter || {};
  }

  populate(field: string, select?: string) {
    if (field === 'referredBy') this.doPopulate = true;
    return this;
  }

  sort(s: any) {
    if (typeof s === 'object' && s) {
      const field = Object.keys(s)[0] || 'createdAt';
      const dir = s[field] === 1 ? 'ASC' : 'DESC';
      this.sortOrder = `ORDER BY u.${field} ${dir}`;
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

  select(s: string) {
    if (s.includes('-password')) this.stripPassword = true;
    return this;
  }

  session(s: any) {
    return this;
  }

  lean() {
    return this;
  }

  async exec(): Promise<IUser[]> {
    const { whereSql, params } = buildUserWhere(this.filter);
    let sql = `SELECT u.* ${
      this.doPopulate
        ? ', r.id as ref_id, r.name as ref_name, r.email as ref_email, r.referralCode as ref_referralCode'
        : ''
    } FROM users u`;

    if (this.doPopulate) {
      sql += ' LEFT JOIN users r ON u.referredBy = r.id';
    }

    sql += ` ${whereSql} ${this.sortOrder}`;

    if (this.limitVal !== undefined) {
      sql += ` LIMIT ${Number(this.limitVal)} OFFSET ${Number(this.skipVal)}`;
    }

    const rows = await query<any>(sql, params);
    return rows.map((r) => {
      const u = rowToUser(r)!;
      if (this.stripPassword) delete u.password;
      return u;
    });
  }

  then<TResult1 = IUser[], TResult2 = never>(
    onfulfilled?: ((value: IUser[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

class UserSingleQueryChain implements PromiseLike<IUser | null> {
  private filter: any;
  private doPopulate: boolean = false;
  private stripPassword: boolean = false;

  constructor(filter?: any) {
    this.filter = filter || {};
  }

  populate(field: string, select?: string) {
    if (field === 'referredBy') this.doPopulate = true;
    return this;
  }

  select(s: string) {
    if (s.includes('-password')) this.stripPassword = true;
    return this;
  }

  session(s: any) {
    return this;
  }

  lean() {
    return this;
  }

  async exec(): Promise<IUser | null> {
    const { whereSql, params } = buildUserWhere(this.filter);
    let sql = `SELECT u.* ${
      this.doPopulate
        ? ', r.id as ref_id, r.name as ref_name, r.email as ref_email, r.referralCode as ref_referralCode'
        : ''
    } FROM users u`;

    if (this.doPopulate) {
      sql += ' LEFT JOIN users r ON u.referredBy = r.id';
    }

    sql += ` ${whereSql} LIMIT 1`;

    const row = await queryOne<any>(sql, params);
    if (!row) return null;
    const u = rowToUser(row)!;
    if (this.stripPassword) delete u.password;
    return u;
  }

  then<TResult1 = IUser | null, TResult2 = never>(
    onfulfilled?: ((value: IUser | null) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

function buildUserWhere(filter: any): { whereSql: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];

  if (!filter || Object.keys(filter).length === 0) {
    return { whereSql: '', params: [] };
  }

  if (filter._id || filter.id) {
    const idVal = filter._id || filter.id;
    if (typeof idVal === 'object' && idVal.$in) {
      clauses.push(`u.id IN (?)`);
      params.push(idVal.$in.map((x: any) => (typeof x === 'object' ? x.toString() : x)));
    } else {
      clauses.push('u.id = ?');
      params.push(typeof idVal === 'object' ? idVal.toString() : idVal);
    }
  }

  if (filter.email) {
    clauses.push('u.email = ?');
    params.push(filter.email.toString().toLowerCase().trim());
  }

  if (filter.phone) {
    clauses.push('u.phone = ?');
    params.push(filter.phone.toString().trim());
  }

  if (filter.loginId) {
    clauses.push('u.loginId = ?');
    params.push(filter.loginId);
  }

  if (filter.referralCode) {
    clauses.push('u.referralCode = ?');
    params.push(filter.referralCode);
  }

  if (filter.role) {
    clauses.push('u.role = ?');
    params.push(filter.role);
  }

  if (filter.status) {
    if (typeof filter.status === 'object' && filter.status.$ne) {
      clauses.push('u.status != ?');
      params.push(filter.status.$ne);
    } else {
      clauses.push('u.status = ?');
      params.push(filter.status);
    }
  }

  if (filter.referredBy !== undefined) {
    if (filter.referredBy === null) {
      clauses.push('(u.referredBy IS NULL OR u.referredBy = "")');
    } else if (typeof filter.referredBy === 'object' && filter.referredBy.$in) {
      clauses.push('u.referredBy IN (?)');
      params.push(filter.referredBy.$in.map((x: any) => (typeof x === 'object' ? x.toString() : x)));
    } else {
      clauses.push('u.referredBy = ?');
      params.push(typeof filter.referredBy === 'object' ? filter.referredBy.toString() : filter.referredBy);
    }
  }

  if (filter.$or && Array.isArray(filter.$or)) {
    const orClauses: string[] = [];
    for (const cond of filter.$or) {
      if (cond.email && cond.email.$regex) {
        orClauses.push('u.email LIKE ?');
        params.push(`%${cond.email.$regex || cond.email}%`);
      } else if (cond.email) {
        orClauses.push('u.email = ?');
        params.push(cond.email.toString().toLowerCase().trim());
      } else if (cond.phone) {
        orClauses.push('u.phone = ?');
        params.push(cond.phone.toString().trim());
      } else if (cond.loginId) {
        orClauses.push('u.loginId = ?');
        params.push(cond.loginId);
      } else if (cond.name) {
        orClauses.push('u.name LIKE ?');
        params.push(`%${cond.name.$regex || cond.name}%`);
      } else if (cond.referralCode) {
        orClauses.push('u.referralCode LIKE ?');
        params.push(`%${cond.referralCode.$regex || cond.referralCode}%`);
      } else if (cond.referredBy === null || (cond.referredBy && cond.referredBy.$exists === false)) {
        orClauses.push('(u.referredBy IS NULL OR u.referredBy = "")');
      }
    }
    if (orClauses.length > 0) {
      clauses.push(`(${orClauses.join(' OR ')})`);
    }
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

export const User = {
  findById(id: string) {
    const cleanId = typeof id === 'object' ? (id as any).toString() : id;
    return new UserSingleQueryChain({ _id: cleanId });
  },

  findOne(filter: any) {
    return new UserSingleQueryChain(filter);
  },

  find(filter?: any) {
    return new UserQueryChain(filter);
  },

  async findByIdAndUpdate(id: string, update: any, options?: any) {
    const cleanId = typeof id === 'object' ? (id as any).toString() : id;
    const sets: string[] = ['updatedAt = NOW()'];
    const params: any[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      password: 'password',
      loginId: 'loginId',
      mustChangePassword: 'mustChangePassword',
      role: 'role',
      referralCode: 'referralCode',
      referredBy: 'referredBy',
      status: 'status',
      statusRemark: 'statusRemark',
      commissionRate: 'commissionRate',
      totalSales: 'totalSales',
      totalCommission: 'totalCommission',
      dob: 'dob',
      gender: 'gender',
      address: 'address',
      city: 'city',
      state: 'state',
      pinCode: 'pinCode',
      fatherSpouseName: 'fatherSpouseName',
      photo: 'photo',
      panCard: 'panCard',
      aadhaarCard: 'aadhaarCard',
      aadhaarCardFront: 'aadhaarCardFront',
      aadhaarCardBack: 'aadhaarCardBack',
    };

    for (const [key, val] of Object.entries(update)) {
      if (key === '$inc') {
        for (const [incKey, incVal] of Object.entries(val as any)) {
          if (fieldMap[incKey]) {
            sets.push(`${fieldMap[incKey]} = ${fieldMap[incKey]} + ?`);
            params.push(Number(incVal));
          }
        }
      } else if (fieldMap[key]) {
        sets.push(`${fieldMap[key]} = ?`);
        params.push(val === undefined ? null : val);
      }
    }

    params.push(cleanId);
    await execute(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
    return User.findById(cleanId);
  },

  async create(data: any) {
    const id = data.id || data._id || crypto.randomUUID();
    const cleanId = typeof id === 'object' ? id.toString() : id;

    await execute(
      `INSERT INTO users (
        id, name, email, phone, password, loginId,
        mustChangePassword, role, referralCode, referredBy,
        status, statusRemark, commissionRate, totalSales,
        totalCommission, dob, gender, address, city,
        state, pinCode, fatherSpouseName, photo,
        panCard, aadhaarCard, aadhaarCardFront, aadhaarCardBack,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        cleanId,
        data.name?.trim(),
        data.email?.toLowerCase().trim(),
        data.phone?.trim(),
        data.password || null,
        data.loginId || null,
        data.mustChangePassword ? 1 : 0,
        data.role || UserRole.SAKHI,
        data.referralCode,
        data.referredBy ? (typeof data.referredBy === 'object' ? data.referredBy.toString() : data.referredBy) : null,
        data.status || UserStatus.PENDING,
        data.statusRemark || null,
        Number(data.commissionRate ?? 35),
        Number(data.totalSales ?? 0),
        Number(data.totalCommission ?? 0),
        data.dob || null,
        data.gender || null,
        data.address || null,
        data.city || null,
        data.state || null,
        data.pinCode || null,
        data.fatherSpouseName || null,
        data.photo || null,
        data.panCard || null,
        data.aadhaarCard || null,
        data.aadhaarCardFront || null,
        data.aadhaarCardBack || null,
      ]
    );

    const created = await User.findById(cleanId);
    return created as IUser;
  },

  async countDocuments(filter?: any) {
    const { whereSql, params } = buildUserWhere(filter);
    const row = await queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM users u ${whereSql}`, params);
    return Number(row?.count || 0);
  },

  async aggregate(pipeline: any[]): Promise<any[]> {
    // Custom aggregation router for common pipeline patterns
    // 1. Facet stats
    if (pipeline.some((p) => p.$facet)) {
      const stats = await queryOne<any>(`
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
      return [
        {
          total: [{ count: Number(stats?.total || 0) }],
          active: [{ count: Number(stats?.active || 0) }],
          teams: [{ count: Number(stats?.teams || 0) }],
          sakhis: [{ count: Number(stats?.sakhis || 0) }],
          blocked: [{ count: Number(stats?.blocked || 0) }],
          inactive: [{ count: Number(stats?.inactive || 0) }],
          pending: [{ count: Number(stats?.pending || 0) }],
        },
      ];
    }

    // 2. Network graphLookup
    const matchStage = pipeline.find((p) => p.$match);
    const graphStage = pipeline.find((p) => p.$graphLookup);

    if (matchStage && graphStage) {
      let targetIds: string[] = [];
      const idVal = matchStage.$match._id || matchStage.$match.id;

      if (idVal) {
        if (typeof idVal === 'object' && idVal.$in && Array.isArray(idVal.$in)) {
          targetIds = idVal.$in.map((x: any) => (typeof x === 'object' ? x.toString() : String(x)));
        } else if (typeof idVal === 'object') {
          targetIds = [idVal.toString()];
        } else {
          targetIds = [String(idVal)];
        }
      }

      if (targetIds.length === 0) return [];

      const results: any[] = [];
      for (const targetId of targetIds) {
        const rootUser = await queryOne<any>('SELECT * FROM users WHERE id = ?', [targetId]);
        if (!rootUser) continue;

        const networkRows = await query<any>(
          `WITH RECURSIVE downline AS (
            SELECT id, name, email, phone, role, status, referralCode, referredBy, totalSales, totalCommission, createdAt, 1 as level
            FROM users WHERE referredBy = ?
            UNION ALL
            SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.referralCode, u.referredBy, u.totalSales, u.totalCommission, u.createdAt, d.level + 1
            FROM users u INNER JOIN downline d ON u.referredBy = d.id
          )
          SELECT * FROM downline`,
          [targetId]
        );

        results.push({
          _id: rootUser.id,
          name: rootUser.name,
          email: rootUser.email,
          role: rootUser.role,
          status: rootUser.status,
          referralCode: rootUser.referralCode,
          totalSales: Number(rootUser.totalSales || 0),
          totalCommission: Number(rootUser.totalCommission || 0),
          createdAt: rootUser.createdAt,
          network: networkRows.map((r) => ({
            ...r,
            _id: r.id,
            totalSales: Number(r.totalSales || 0),
            totalCommission: Number(r.totalCommission || 0),
          })),
        });
      }

      return results;
    }

    return [];
  },
};

export default User;
