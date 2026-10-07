import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import AuditLog from '@/models/AuditLog';
import { Activity, Search } from 'lucide-react';

export default async function AdminAuditLogsPage({ searchParams }: { searchParams: Promise<{ page?: string, action?: string }> }) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
    redirect('/unauthorized');
  }

  await connectDB();

  const page = parseInt(resolvedParams.page || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (resolvedParams.action) {
    query.action = { $regex: resolvedParams.action, $options: 'i' };
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'name email')
      .lean(),
    AuditLog.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by action..."
            defaultValue={resolvedParams.action}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            disabled // Server-side search to be implemented fully with client component if needed, keeping simple for UI
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin/User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <Activity className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log._id.toString()} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.performedBy?.name || 'System'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {log.performedBy?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>Entity: {log.entityType}</div>
                      <div className="text-xs text-gray-400 mt-1 max-w-xs truncate" title={JSON.stringify(log.details)}>
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-700">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm">Previous</button>
              <button disabled={page === totalPages} className="px-3 py-1 border rounded-md disabled:opacity-50 text-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
