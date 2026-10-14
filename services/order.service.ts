import crypto from 'crypto';
import { queryOne, transaction } from '@/lib/mysql';

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

export async function createOrderWithCommission(data: {
  customerId: string;
  productId: string;
  quantity: number;
}) {
  return transaction(async (conn) => {
    const [pRows]: any = await conn.execute('SELECT * FROM products WHERE id = ?', [data.productId]);
    const product = pRows && pRows.length > 0 ? pRows[0] : null;
    if (!product) throw new Error('Product not found');

    if (product.stock < data.quantity) {
      throw new Error('Insufficient stock');
    }

    const [cRows]: any = await conn.execute('SELECT * FROM users WHERE id = ?', [data.customerId]);
    const customer = cRows && cRows.length > 0 ? cRows[0] : null;
    if (!customer) throw new Error('Customer not found');

    const totalAmount = Number(product.price) * data.quantity;
    let commissionAmount = 0;
    let commissionRate = 0;
    let referrerId: string | null = customer.referredBy || null;

    if (referrerId) {
      const [refRows]: any = await conn.execute('SELECT * FROM users WHERE id = ?', [referrerId]);
      const referrer = refRows && refRows.length > 0 ? refRows[0] : null;
      if (referrer && referrer.status === 'ACTIVE') {
        commissionRate = Number(referrer.commissionRate || product.commissionRate || 35);
        commissionAmount = (totalAmount * commissionRate) / 100;
      } else {
        referrerId = null;
      }
    }

    const orderId = crypto.randomUUID();
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create the Order
    await conn.execute(
      `INSERT INTO orders (
        id, orderNumber, customer, product, quantity, price,
        totalAmount, referredBy, commissionRate, commissionAmount,
        paymentStatus, orderStatus, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        orderId,
        orderNumber,
        customer.id,
        product.id,
        data.quantity,
        product.price,
        totalAmount,
        referrerId,
        commissionRate,
        commissionAmount,
        PaymentStatus.PENDING,
        OrderStatus.PENDING,
      ]
    );

    // 2. Reduce Product Stock
    await conn.execute(
      'UPDATE products SET stock = stock - ?, updatedAt = NOW() WHERE id = ?',
      [data.quantity, product.id]
    );

    // 3. Create Commission if there's a valid referrer
    if (referrerId && commissionAmount > 0) {
      const commissionId = crypto.randomUUID();
      await conn.execute(
        `INSERT INTO commissions (
          id, user, \`order\`, saleAmount, commissionRate,
          commissionAmount, status, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', NOW(), NOW())`,
        [commissionId, referrerId, orderId, totalAmount, commissionRate, commissionAmount]
      );
    }

    return {
      id: orderId,
      _id: orderId,
      orderNumber,
      customer: customer.id,
      product: product.id,
      quantity: data.quantity,
      price: product.price,
      totalAmount,
      referredBy: referrerId,
      commissionRate,
      commissionAmount,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
    };
  });
}
