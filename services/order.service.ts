import mongoose from 'mongoose';
import Order, { OrderStatus, PaymentStatus } from '@/models/Order';
import Commission, { CommissionStatus } from '@/models/Commission';
import User from '@/models/User';
import Product from '@/models/Product';
import dbConnect from '@/lib/mongodb';

export async function createOrderWithCommission(data: {
  customerId: string;
  productId: string;
  quantity: number;
}) {
  await dbConnect();
  
  // Start a MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const product = await Product.findById(data.productId).session(session);
    if (!product) {
      throw new Error('Product not found');
    }
    
    if (product.stock < data.quantity) {
      throw new Error('Insufficient stock');
    }

    const customer = await User.findById(data.customerId).session(session);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const totalAmount = product.price * data.quantity;
    
    // Check if the customer has a referrer
    let commissionAmount = 0;
    let commissionRate = 0;
    let referrerId = customer.referredBy;

    if (referrerId) {
      const referrer = await User.findById(referrerId).session(session);
      if (referrer && referrer.status === 'ACTIVE') {
        // Use user's specific commission rate or product's commission rate or fallback to 35%
        // Using the referrer's commission rate as priority
        commissionRate = referrer.commissionRate || product.commissionRate || 35;
        commissionAmount = (totalAmount * commissionRate) / 100;
      } else {
        referrerId = undefined; // Referrer inactive, no commission
      }
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // 1. Create the Order
    const order = await Order.create([{
      orderNumber,
      customer: customer._id,
      product: product._id,
      quantity: data.quantity,
      price: product.price,
      totalAmount,
      referredBy: referrerId,
      commissionRate,
      commissionAmount,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
    }], { session });

    // 2. Reduce Product Stock
    await Product.findByIdAndUpdate(product._id, {
      $inc: { stock: -data.quantity }
    }, { session });

    // 3. Create Commission if there's a valid referrer
    if (referrerId && commissionAmount > 0) {
      await Commission.create([{
        user: referrerId,
        order: order[0]._id,
        saleAmount: totalAmount,
        commissionRate,
        commissionAmount,
        status: CommissionStatus.PENDING,
      }], { session });
    }

    await session.commitTransaction();
    session.endSession();
    
    return order[0];
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}
