import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import { getUsers, getSakhiStats } from '@/services/user.service';
import Link from 'next/link';
import { Search, HeartHandshake, CheckCircle, Ban, Clock, UserPlus, Network } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserTableActions from '../users/UserTableActions';

export const metadata: Metadata = {
  title: 'Sakhi Management | Amifresh Admin',
};

export default async function AdminSakhiPage({
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
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  // Filter explicitly by role: SAKHI
  const [{ users, totalPages, total }, stats] = await Promise.all([
    getUsers({ page, limit, search, role: UserRole.SAKHI, status }),
    getSakhiStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <HeartHandshake size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Sakhi</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Manage all registered Sakhi, network genealogies, and KYC statuses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/network"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 hover:border-primary text-gray-700 hover:text-primary rounded-xl text-xs sm:text-sm font-semibold bg-white transition-all shadow-sm"
          >
            <Network size={16} />
            <span>Network Tree</span>
          </Link>

          <Link
            href="/admin/registrations"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow"
          >
            <UserPlus size={16} />
            <span>Pending KYC</span>
            {stats.pending > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white text-accent font-bold text-xs rounded-full">
                {stats.pending}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link
          href="/admin/sakhi"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-primary hover:bg-primary-light/50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-primary-dark">
            Total Sakhi
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">{stats.total}</div>
        </Link>

        <Link
          href="/admin/sakhi?status=ACTIVE"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-green-500 hover:bg-green-50/50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-green-700">
              Active Sakhi
            </span>
            <CheckCircle size={15} className="text-green-600" />
          </div>
          <div className="text-2xl font-extrabold text-green-600 mt-2">{stats.active}</div>
        </Link>

        <Link
          href="/admin/registrations"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-amber-500 hover:bg-amber-50/50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-amber-700">
              Pending KYC
            </span>
            <Clock size={15} className="text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 mt-2">{stats.pending}</div>
        </Link>

        <Link
          href="/admin/sakhi?status=INACTIVE"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-gray-400 hover:bg-gray-50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
            Inactive
          </div>
          <div className="text-2xl font-extrabold text-gray-600 mt-2">{stats.inactive}</div>
        </Link>

        <Link
          href="/admin/sakhi?status=BLOCKED"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-red-400 hover:bg-red-50/50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-red-700">
              Blocked
            </span>
            <Ban size={15} className="text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">{stats.blocked}</div>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <form action="/admin/sakhi" method="GET" className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by Sakhi name, email, phone, referral code..."
                className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
              />
            </div>
            <select
              name="status"
              defaultValue={status || ''}
              className="border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary bg-white outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <Button type="submit" className="py-2 rounded-xl">Filter</Button>
            {(search || status) && (
              <Link
                href="/admin/sakhi"
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-xl bg-white inline-flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                Clear
              </Link>
            )}
          </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f8faf8]">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Sakhi
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Referral Info
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Network & Sales
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <HeartHandshake size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-gray-600">No Sakhi found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((sakhi: any) => {
                  const initials = sakhi.name
                    ? sakhi.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'SK';

                  return (
                    <tr key={sakhi._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{sakhi.name}</div>
                            <div className="text-xs text-gray-500">{sakhi.email}</div>
                            <div className="text-xs text-gray-500">{sakhi.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md inline-block">
                          {sakhi.referralCode}
                        </div>
                        {sakhi.loginId && (
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            ID: {sakhi.loginId}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Sponsor:{' '}
                          <span className="font-medium text-gray-700">
                            {sakhi.referredBy?.name || 'Amifresh Direct'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/admin/network?root=${sakhi.referralCode}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark bg-primary-light/60 px-2.5 py-1 rounded-md hover:bg-primary-light transition-colors"
                        >
                          <Network size={13} />
                          <span>{sakhi.directReferralCount || 0} Direct Sakhi</span>
                        </Link>
                        <div className="text-[11px] text-gray-500 mt-1">
                          Commission: ₹{(sakhi.totalCommission || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${
                            sakhi.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : sakhi.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : sakhi.status === 'BLOCKED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {sakhi.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(sakhi.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/network?root=${sakhi.referralCode}`}
                            className="text-gray-500 hover:text-primary p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title="View Network Tree"
                          >
                            <Network size={16} />
                          </Link>

                          <UserTableActions
                            userId={sakhi._id.toString()}
                            userReferralCode={sakhi.referralCode}
                            currentStatus={sakhi.status}
                            isSelf={session.user.id === sakhi._id.toString()}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing page <span className="font-medium">{page}</span> of{' '}
              <span className="font-medium">{totalPages}</span> ({total} total Sakhi)
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/sakhi?page=${page - 1}${search ? `&search=${search}` : ''}${
                    status ? `&status=${status}` : ''
                  }`}
                  className="px-4 py-2 border rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/sakhi?page=${page + 1}${search ? `&search=${search}` : ''}${
                    status ? `&status=${status}` : ''
                  }`}
                  className="px-4 py-2 border rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors"
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
