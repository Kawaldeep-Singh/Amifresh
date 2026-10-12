import React from 'react';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';

export default function AdminAuditLogsLoading() {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Filter Skeleton */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
        <Skeleton className="h-10 w-full sm:w-72 rounded-lg" />
      </div>

      {/* Audit Logs Table Skeleton */}
      <TableSkeleton rows={8} cols={5} />
    </div>
  );
}
