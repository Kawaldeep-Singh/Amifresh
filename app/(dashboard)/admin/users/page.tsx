import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import { getUsers, getAdminUserStats } from '@/services/user.service';
import Link from 'next/link';
import { Search, Filter, Eye, MoreVertical, ShieldAlert, CheckCircle, Ban, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserTableActions from './UserTableActions';

export const metadata: Metadata = {
  title: 'User Management | Amifresh Admin',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
    redirect('/login');
  }

  await connectDB();

  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const limit = typeof resolvedParams.limit === 'string' ? parseInt(resolvedParams.limit, 10) : 10;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const role = typeof resolvedParams.role === 'string' ? resolvedParams.role : undefined;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  const [{ users, totalPages, total }, stats] = await Promise.all([
    getUsers({ page, limit, search, role, status }),
    getAdminUserStats()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage roles, statuses, and view user details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Link href="/admin/users" className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-primary hover:bg-primary-light transition-all hover:shadow-md cursor-pointer block group">
          <div className="text-sm text-gray-500 group-hover:text-primary-dark">Total Users</div>
          <div className="text-2xl font-extrabold text-gray-900">{stats.total}</div>
        </Link>
        <Link href="/admin/users?status=ACTIVE" className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-primary hover:bg-primary-light transition-all hover:shadow-md cursor-pointer block group">
          <div className="text-sm text-gray-500 group-hover:text-primary-dark">Active</div>
          <div className="text-2xl font-extrabold text-primary">{stats.active}</div>
        </Link>
        <Link href="/admin/users?role=TEAM" className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-primary hover:bg-primary-light transition-all hover:shadow-md cursor-pointer block group">
          <div className="text-sm text-gray-500 group-hover:text-primary-dark">Teams</div>
          <div className="text-2xl font-extrabold text-accent">{stats.teams}</div>
        </Link>
        <Link href="/admin/users?role=SAKHI" className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-primary hover:bg-primary-light transition-all hover:shadow-md cursor-pointer block group">
          <div className="text-sm text-gray-500 group-hover:text-primary-dark">Sakhis</div>
          <div className="text-2xl font-extrabold text-primary-dark">{stats.sakhis}</div>
        </Link>
        <Link href="/admin/users?status=BLOCKED" className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-danger hover:bg-red-50 transition-all hover:shadow-md cursor-pointer block group">
          <div className="text-sm text-gray-500 group-hover:text-danger">Blocked</div>
          <div className="text-2xl font-extrabold text-danger">{stats.blocked}</div>
        </Link>
        <Link href="/admin/users?status=INACTIVE" className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-primary hover:bg-gray-50 transition-all hover:shadow-md cursor-pointer block group">
          <div className="text-sm text-gray-500 group-hover:text-gray-700">Inactive</div>
          <div className="text-2xl font-extrabold text-gray-600">{stats.inactive}</div>
        </Link>
        <Link href="/admin/registrations" className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-accent hover:bg-orange-50 transition-all hover:shadow-md cursor-pointer block group">
          <div className="text-sm text-gray-500 group-hover:text-accent">Pending</div>
          <div className="text-2xl font-extrabold text-orange-500">{stats.pending}</div>
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <form action="/admin/users" method="GET" className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                name="search" 
                defaultValue={search} 
                placeholder="Search by name, email, phone, code..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <select 
              name="role" 
              defaultValue={role || ''}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary bg-white outline-none"
            >
              <option value="">All Roles</option>
              <option value="ROOT_ADMIN">Root Admin</option>
              <option value="TEAM">Team</option>
              <option value="SAKHI">Sakhi</option>
            </select>
            <select 
              name="status" 
              defaultValue={status || ''}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary bg-white outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <Button type="submit" className="py-2">Filter</Button>
            {(search || role || status) && (
              <Link href="/admin/users" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg bg-white inline-flex items-center justify-center">
                Clear
              </Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-primary-light">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-dark uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-dark uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-dark uppercase tracking-wider">Referral Info</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-primary-dark uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-primary-dark uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : users.map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-medium mb-1">{user.role}</div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      user.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                      user.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Code: <span className="font-mono font-medium">{user.referralCode}</span></div>
                    <div className="text-sm text-gray-500">Ref: {user.referredBy?.name || 'N/A'}</div>
                    <div className="text-xs text-primary mt-1">{user.directReferralCount} Direct Referrals</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <UserTableActions 
                      userId={user._id.toString()} 
                      userReferralCode={user.referralCode}
                      currentStatus={user.status} 
                      isSelf={session.user.id === user._id.toString()} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({total} total users)
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link 
                  href={`/admin/users?page=${page - 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link 
                  href={`/admin/users?page=${page + 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
