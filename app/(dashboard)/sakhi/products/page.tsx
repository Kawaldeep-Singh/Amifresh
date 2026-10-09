import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { Search, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default async function MemberProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();

  const query: any = { status: 'ACTIVE' };
  if (resolvedParams.q) {
    query.name = { $regex: resolvedParams.q, $options: 'i' };
  }

  const products = await Product.find(query).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex">
        <form action="/member/products" method="GET" className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            name="q"
            placeholder="Search products..."
            defaultValue={resolvedParams.q}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No products available</h3>
          <p className="mt-2 text-sm text-gray-500">Check back later for new products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div key={product._id.toString()} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-square bg-gray-100 relative">
                {product.images && product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <Package size={48} />
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="px-3 py-1 bg-gray-900 text-white text-sm font-medium rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1 mb-4 flex-1">{product.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
                  <Link 
                    href={`/member/products/${product._id.toString()}`}
                    className="flex items-center px-3 py-1.5 bg-primary-light text-primary-dark hover:bg-primary-light rounded-md text-sm font-medium transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
