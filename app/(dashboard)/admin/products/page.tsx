import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductsClient from './ProductsClient';

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
    redirect('/unauthorized');
  }

  await connectDB();

  // Load all products initially
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  
  // Serialize ObjectId to string for client component
  const serializedProducts = products.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    createdBy: p.createdBy?.toString(),
    createdAt: p.createdAt?.toISOString(),
    updatedAt: p.updatedAt?.toISOString()
  }));

  return <ProductsClient initialProducts={serializedProducts} />;
}
