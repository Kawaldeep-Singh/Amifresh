import React from 'react';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function TeamDashboardLoading() {
  return (
    <div className="mb-8 space-y-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* 4 Metric Cards */}
      <CardSkeleton count={4} />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
