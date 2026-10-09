import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import { getTeamTeam, getTeamTeamStats } from '@/services/team.service';
import Link from 'next/link';
import { Search, Filter, Eye, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'My Team | Amifresh Team',
};

export default async function TeamTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.TEAM) {
    redirect('/login');
  }

  await connectDB();

  const page = typeof resolvedParams.page === 'string' ? parseInt(resolvedParams.page, 10) : 1;
  const limit = typeof resolvedParams.limit === 'string' ? parseInt(resolvedParams.limit, 10) : 10;
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : undefined;
  const role = typeof resolvedParams.role === 'string' ? resolvedParams.role : undefined;
  const status = typeof resolvedParams.status === 'string' ? resolvedParams.status : undefined;

  const [{ team, totalPages, total }, stats] = await Promise.all([
    getTeamTeam({ teamId: session.user.id, page, limit, search, role, status }),
    getTeamTeamStats(session.user.id)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-primary" />
            My Team
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            View and search your referral network.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Total Network</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Active Sakhis</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Inactive/Other</div>
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="text-sm text-gray-500">Direct Referrals</div>
          <div className="text-2xl font-bold text-primary">{stats.directReferrals}</div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <form action="/team/team" method="GET" className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                name="search" 
                defaultValue={search} 
                placeholder="Search team by name, email, phone, code..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>
            <select 
              name="role" 
              defaultValue={role || ''}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary bg-white outline-none"
            >
              <option value="">All Roles</option>
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
            </select>
            <Button type="submit" className="py-2">Filter</Button>
            {(search || role || status) && (
              <Link href="/team/team" className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border rounded-lg bg-white inline-flex items-center justify-center">
                Clear
              </Link>
            )}
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sakhi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referral Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {team.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No team sakhis found matching your criteria.
                  </td>
                </tr>
              ) : team.map((user: any) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span> ({total} team sakhis)
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link 
                  href={`/team/team?page=${page - 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}${status ? `&status=${status}` : ''}`}
                  className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link 
                  href={`/team/team?page=${page + 1}${search ? `&search=${search}` : ''}${role ? `&role=${role}` : ''}${status ? `&status=${status}` : ''}`}
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
