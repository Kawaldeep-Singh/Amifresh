import React from 'react';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function SakhiDashboardLoading() {
  return (
    <div className="mb-8 space-y-6">
      {/* Welcome Banner Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Referral Link Box Skeleton */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-11 w-full max-w-xl rounded-lg" />
      </div>

      {/* 4 Metric Cards Skeleton */}
      <CardSkeleton count={4} />

      {/* Activity / Overview Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-44 w-full rounded-lg" />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-64 space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-44 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
