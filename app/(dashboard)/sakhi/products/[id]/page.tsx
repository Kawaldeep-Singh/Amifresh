import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { Package, ShoppingCart, ArrowLeft, Check, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import mongoose from 'mongoose';

export default async function MemberProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  if (!mongoose.isValidObjectId(resolvedParams.id)) {
    redirect('/member/products');
  }

  await connectDB();
  const product = await Product.findOne({ _id: resolvedParams.id, status: 'ACTIVE' }).lean();

  if (!product) {
    redirect('/member/products');
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/member/products" className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={16} className="mr-1" />
          Back to Catalog
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="bg-gray-50 p-8 flex items-center justify-center border-r border-gray-200">
            {product.images && product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.name} className="w-full max-w-md h-auto object-cover rounded-xl shadow-sm" />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 w-full aspect-square max-w-md rounded-xl bg-gray-100 border-2 border-dashed border-gray-200">
                <Package size={64} className="mb-4 text-gray-300" />
                <span>No image available</span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-8 flex flex-col">
            <div className="mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-dark">
                Product
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-6">Ref: {product.slug}</p>
            
            <div className="mb-8">
              <span className="text-4xl font-extrabold text-gray-900">₹{product.price.toFixed(2)}</span>
            </div>
            
            <div className="prose prose-sm text-gray-600 mb-8 flex-1">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex items-center text-sm">
                {product.stock > 0 ? (
                  <>
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">In Stock ({product.stock} available)</span>
                  </>
                ) : (
                  <>
                    <div className="h-2 w-2 rounded-full bg-red-500 mr-2 flex-shrink-0" />
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  </>
                )}
              </div>
              <div className="flex items-center text-sm">
                <ShieldCheck className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                <span className="text-gray-600">Authentic Amifresh Product</span>
              </div>
            </div>

            <div className="mt-8 pt-6">
              <button 
                disabled={product.stock <= 0}
                className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
              >
                <ShoppingCart className="mr-2" size={20} />
                {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                Purchasing functionality will be available in a future phase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
