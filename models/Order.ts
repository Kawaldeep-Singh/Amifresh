import crypto from 'crypto';
import { queryOne, execute } from '@/lib/mysql';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURNED = 'RETURNED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface IOrder {
  _id: string;
  id: string;
  orderNumber: string;
  customer: any;
  product: any;
  quantity: number;
  price: number;
  totalAmount: number;
  referredBy?: any;
  commissionRate: number;
  commissionAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const Order = {
  async findById(id: string) {
    const row = await queryOne<any>('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
    if (!row) return null;
    return {
      ...row,
      _id: row.id,
      id: row.id,
      quantity: Number(row.quantity || 1),
      price: Number(row.price || 0),
      totalAmount: Number(row.totalAmount || 0),
      commissionRate: Number(row.commissionRate || 0),
      commissionAmount: Number(row.commissionAmount || 0),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    };
  },

  async create(data: any | any[], opts?: any) {
    const items = Array.isArray(data) ? data : [data];
    const results: IOrder[] = [];

    for (const item of items) {
      const id = item.id || item._id || crypto.randomUUID();
      const customer = typeof item.customer === 'object' ? item.customer.toString() : item.customer;
      const product = typeof item.product === 'object' ? item.product.toString() : item.product;
      const referredBy = item.referredBy ? (typeof item.referredBy === 'object' ? item.referredBy.toString() : item.referredBy) : null;

      await execute(
        `INSERT INTO orders (
          id, orderNumber, customer, product, quantity, price,
          totalAmount, referredBy, commissionRate, commissionAmount,
          paymentStatus, orderStatus, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id,
          item.orderNumber,
          customer,
          product,
          Number(item.quantity || 1),
          Number(item.price || 0),
          Number(item.totalAmount || 0),
          referredBy,
          Number(item.commissionRate || 0),
          Number(item.commissionAmount || 0),
          item.paymentStatus || PaymentStatus.PENDING,
          item.orderStatus || OrderStatus.PENDING,
        ]
      );

      results.push({
        _id: id,
        id,
        orderNumber: item.orderNumber,
        customer,
        product,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        totalAmount: Number(item.totalAmount || 0),
        referredBy,
        commissionRate: Number(item.commissionRate || 0),
        commissionAmount: Number(item.commissionAmount || 0),
        paymentStatus: item.paymentStatus || PaymentStatus.PENDING,
        orderStatus: item.orderStatus || OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return Array.isArray(data) ? results : results[0];
  },
};

export default Order;
