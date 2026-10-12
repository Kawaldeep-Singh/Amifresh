import React from 'react';
import { Skeleton, ProductGridSkeleton } from '@/components/ui/Skeleton';

export default function MemberProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-52" />
      </div>

      {/* Search Input Skeleton */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex">
        <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
      </div>

      {/* Product Grid Skeleton */}
      <ProductGridSkeleton count={8} />
    </div>
  );
}
