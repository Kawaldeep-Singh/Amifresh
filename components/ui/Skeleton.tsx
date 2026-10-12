import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200/80 ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"
        >
          <Skeleton className="h-12 w-12 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Table Header Skeleton */}
      <div className="bg-primary-light/40 border-b border-gray-200 px-6 py-4 flex items-center gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1 bg-gray-300/60" />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 flex items-center gap-6">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 space-y-1.5">
                <Skeleton className={`h-4 ${colIndex === 0 ? 'w-3/4' : 'w-1/2'}`} />
                {colIndex === 0 && <Skeleton className="h-3 w-1/3 bg-gray-200/60" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TreeSkeleton() {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-6">
      {/* Root Node Skeleton */}
      <div className="flex justify-center">
        <div className="w-56 p-4 rounded-xl border-2 border-primary/20 bg-primary-light/30 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Connector Line */}
      <div className="w-px h-6 bg-gray-200 mx-auto" />

      {/* Level 1 Nodes */}
      <div className="flex justify-center gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4 flex flex-col items-center">
            <div className="w-48 p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-2.5 w-12" />
              </div>
            </div>
            {/* Child Connector */}
            <div className="w-px h-4 bg-gray-200" />
            {/* Level 2 Sub-child */}
            <div className="w-40 p-2.5 rounded-md border border-gray-100 bg-white shadow-2xs flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
              <Skeleton className="h-3 w-20 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
        >
          <Skeleton className="w-full h-48 rounded-none" />
          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3.5 w-1/2" />
            </div>
            <div className="pt-2 flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
