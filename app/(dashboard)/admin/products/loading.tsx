import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminProductsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
        <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
      </div>

      {/* Products Table Skeleton */}
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
