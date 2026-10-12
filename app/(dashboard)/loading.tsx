export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse w-full max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-7 bg-gray-200 rounded-lg w-56"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-80"></div>
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-gray-100 rounded-full shrink-0"></div>
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-14"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Cards Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
          <div className="h-40 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64">
          <div className="h-5 bg-gray-200 rounded w-36 mb-4"></div>
          <div className="h-40 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
