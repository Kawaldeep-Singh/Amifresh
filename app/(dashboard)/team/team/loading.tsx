import React from 'react';
import { CardSkeleton, TableSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function TeamTeamLoading() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Team Metric Cards Skeleton */}
      <CardSkeleton count={3} />

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
        <div className="flex gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      {/* Team Table Skeleton */}
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
