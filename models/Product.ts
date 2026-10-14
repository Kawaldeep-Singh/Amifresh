import crypto from 'crypto';
import { query, queryOne, execute } from '@/lib/mysql';

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
}

export interface IProduct {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  commissionRate: number;
  status: ProductStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

function rowToProduct(row: any): IProduct | null {
  if (!row) return null;
  let images: string[] = [];
  if (Array.isArray(row.images)) {
    images = row.images;
  } else if (typeof row.images === 'string') {
    try {
      images = JSON.parse(row.images);
    } catch {
      images = [];
    }
  }

  return {
    ...row,
    _id: row.id,
    id: row.id,
    price: Number(row.price || 0),
    stock: Number(row.stock || 0),
    commissionRate: Number(row.commissionRate || 35),
    images,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
  };
}

class ProductQueryChain implements PromiseLike<IProduct[]> {
  private filter: any;
  private sortOrder: string = 'ORDER BY createdAt DESC';
  private limitVal?: number;
  private skipVal: number = 0;

  constructor(filter?: any) {
    this.filter = filter || {};
  }

  sort(s: any) {
    if (typeof s === 'object' && s) {
      const field = Object.keys(s)[0] || 'createdAt';
      const dir = s[field] === 1 ? 'ASC' : 'DESC';
      this.sortOrder = `ORDER BY ${field} ${dir}`;
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

  session(s: any) {
    return this;
  }

  async exec(): Promise<IProduct[]> {
    const { whereSql, params } = buildProductWhere(this.filter);
    let sql = `SELECT * FROM products ${whereSql} ${this.sortOrder}`;
    if (this.limitVal !== undefined) {
      sql += ` LIMIT ${Number(this.limitVal)} OFFSET ${Number(this.skipVal)}`;
    }
    const rows = await query<any>(sql, params);
    return rows.map(rowToProduct) as IProduct[];
  }

  then<TResult1 = IProduct[], TResult2 = never>(
    onfulfilled?: ((value: IProduct[]) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

class ProductSingleQueryChain implements PromiseLike<IProduct | null> {
  private filter: any;

  constructor(filter?: any) {
    this.filter = filter || {};
  }

  lean() {
    return this;
  }

  session(s: any) {
    return this;
  }

  async exec(): Promise<IProduct | null> {
    const { whereSql, params } = buildProductWhere(this.filter);
    const sql = `SELECT * FROM products ${whereSql} LIMIT 1`;
    const row = await queryOne<any>(sql, params);
    return rowToProduct(row);
  }

  then<TResult1 = IProduct | null, TResult2 = never>(
    onfulfilled?: ((value: IProduct | null) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

function buildProductWhere(filter: any): { whereSql: string; params: any[] } {
  const clauses: string[] = [];
  const params: any[] = [];

  if (!filter || Object.keys(filter).length === 0) {
    return { whereSql: '', params: [] };
  }

  if (filter._id || filter.id) {
    clauses.push('id = ?');
    params.push(filter._id || filter.id);
  }

  if (filter.slug) {
    clauses.push('slug = ?');
    params.push(filter.slug);
  }

  if (filter.status) {
    clauses.push('status = ?');
    params.push(filter.status);
  }

  return {
    whereSql: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

export const Product = {
  find(filter?: any) {
    return new ProductQueryChain(filter);
  },

  findOne(filter: any) {
    return new ProductSingleQueryChain(filter);
  },

  findById(id: string) {
    return new ProductSingleQueryChain({ _id: id });
  },

  async findByIdAndUpdate(id: string, update: any, options?: any) {
    const cleanId = typeof id === 'object' ? (id as any).toString() : id;
    const sets: string[] = ['updatedAt = NOW()'];
    const params: any[] = [];

    const fieldMap: Record<string, string> = {
      name: 'name',
      slug: 'slug',
      description: 'description',
      price: 'price',
      stock: 'stock',
      commissionRate: 'commissionRate',
      status: 'status',
    };

    for (const [key, val] of Object.entries(update)) {
      if (key === 'images') {
        sets.push('images = ?');
        params.push(JSON.stringify(val));
      } else if (key === '$inc') {
        for (const [incKey, incVal] of Object.entries(val as any)) {
          if (fieldMap[incKey]) {
            sets.push(`${fieldMap[incKey]} = ${fieldMap[incKey]} + ?`);
            params.push(Number(incVal));
          }
        }
      } else if (fieldMap[key]) {
        sets.push(`${fieldMap[key]} = ?`);
        params.push(val);
      }
    }

    params.push(cleanId);
    await execute(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, params);
    return Product.findById(cleanId);
  },

  async create(data: any) {
    const id = data.id || data._id || crypto.randomUUID();
    const imagesJson = JSON.stringify(data.images || []);

    await execute(
      `INSERT INTO products (
        id, name, slug, description, price, images,
        stock, commissionRate, status, createdBy, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        id,
        data.name,
        data.slug,
        data.description,
        Number(data.price || 0),
        imagesJson,
        Number(data.stock || 0),
        Number(data.commissionRate ?? 35),
        data.status || ProductStatus.ACTIVE,
        data.createdBy,
      ]
    );

    return Product.findById(id);
  },
};

export default Product;
