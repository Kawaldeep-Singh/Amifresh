import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import { getUsers, getEmployeeStats } from '@/services/user.service';
import Link from 'next/link';
import { Search, Briefcase, CheckCircle, Ban, Clock, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import UserTableActions from '../users/UserTableActions';
import AddEmployeeModal from './AddEmployeeModal';

export const metadata: Metadata = {
  title: 'Internal Team & Employees | Amifresh Admin',
};

export default async function AdminEmployeesPage({
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

  // Filter explicitly by role: TEAM
  const [{ users, totalPages, total }, stats] = await Promise.all([
    getUsers({ page, limit, search, role: UserRole.TEAM, status }),
    getEmployeeStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Briefcase size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Internal Employees</h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Manage internal corporate staff, operations team, and system access.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AddEmployeeModal />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/employees"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-primary hover:bg-primary-light/50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-primary-dark">
              Total Employees
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-primary/20 text-gray-600 group-hover:text-primary flex items-center justify-center transition-colors">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mt-2">{stats.total}</div>
        </Link>

        <Link
          href="/admin/employees?status=ACTIVE"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-green-500 hover:bg-green-50/50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-green-700">
              Active Staff
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-green-600 mt-2">{stats.active}</div>
        </Link>

        <Link
          href="/admin/employees?status=INACTIVE"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-gray-400 hover:bg-gray-50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700">
              Inactive
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-600 mt-2">{stats.inactive}</div>
        </Link>

        <Link
          href="/admin/employees?status=BLOCKED"
          className="bg-white p-4 rounded-xl border border-border shadow-sm hover:border-red-400 hover:bg-red-50/50 transition-all hover:shadow-md cursor-pointer block group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-red-700">
              Blocked
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Ban size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-red-600 mt-2">{stats.blocked}</div>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3">
          <form action="/admin/employees" method="GET" className="flex-1 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search by employee name, email, phone, login ID..."
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
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <Button type="submit" className="py-2 rounded-xl">Filter</Button>
            {(search || status) && (
              <Link
                href="/admin/employees"
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
                  Employee
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Login ID / Code
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Designation / Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Briefcase size={36} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium text-gray-600">No employees found.</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Use the &quot;Add Employee&quot; button above to create internal team members.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((employee: any) => {
                  const initials = employee.name
                    ? employee.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'EM';

                  return (
                    <tr key={employee._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-primary text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{employee.name}</div>
                            <div className="text-xs text-gray-500">{employee.email}</div>
                            <div className="text-xs text-gray-500">{employee.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md inline-block">
                          {employee.loginId || employee.referralCode}
                        </div>
                        {employee.loginId && (
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Ref: {employee.referralCode}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-800">
                          {employee.statusRemark || 'Operations & Support'}
                        </div>
                        <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                          Internal Staff (TEAM)
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-4 font-bold rounded-full ${
                            employee.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : employee.status === 'BLOCKED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(employee.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <UserTableActions
                          userId={employee._id.toString()}
                          userReferralCode={employee.referralCode}
                          currentStatus={employee.status}
                          isSelf={session.user.id === employee._id.toString()}
                        />
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
              <span className="font-medium">{totalPages}</span> ({total} total employees)
            </div>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/employees?page=${page - 1}${search ? `&search=${search}` : ''}${
                    status ? `&status=${status}` : ''
                  }`}
                  className="px-4 py-2 border rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/employees?page=${page + 1}${search ? `&search=${search}` : ''}${
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
