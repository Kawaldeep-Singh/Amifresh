import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import { Users, UserPlus, Briefcase, HeartHandshake } from 'lucide-react';
import { getAdminDashboardStats } from '@/services/dashboard.service';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Amifresh Admin',
};

export default async function AdminDashboard() {
  await connection();
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
    redirect('/login');
  }

  const stats = await getAdminDashboardStats();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="text-sm text-gray-600 mt-1">
        System overview and quick metrics.
      </p>

      {/* Metric Cards with Partition Line */}
      <div className="mt-8 mb-8">
        <div className="flex flex-col lg:flex-row items-stretch gap-6">
          {/* Sakhi Metrics Partition */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Sakhi Network
              </span>
              <div className="flex-1 h-px bg-gray-200/70"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/sakhi" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-pink-500 transition-colors hover:shadow-md cursor-pointer block group">
                <div className="h-12 w-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-colors">
                  <HeartHandshake size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Sakhi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSakhis}</p>
                </div>
              </Link>

              <Link href="/admin/sakhi?status=ACTIVE" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-green-500 transition-colors hover:shadow-md cursor-pointer block group">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Sakhi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeSakhis}</p>
                </div>
              </Link>
              
              <Link href="/admin/registrations" className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-yellow-500 transition-colors hover:shadow-md cursor-pointer block group">
                <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                  <UserPlus size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending KYC</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Partition Separator Line */}
          <div className="relative flex items-center justify-center lg:px-1 pt-6">
            {/* Vertical separator on desktop */}
            <div className="hidden lg:block w-[1.5px] h-full min-h-[90px] bg-gray-200 rounded-full"></div>
            {/* Horizontal separator on mobile */}
            <div className="lg:hidden w-full h-[1px] bg-gray-200 my-1"></div>
          </div>

          {/* Internal Team Partition */}
          <div className="lg:w-72 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Internal Team
              </span>
              <div className="flex-1 h-px bg-gray-200/70"></div>
            </div>

            <Link href="/admin/employees" className="h-[calc(100%-28px)] bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-primary transition-all hover:shadow-md cursor-pointer block group">
              <div className="h-12 w-12 bg-primary-light text-primary rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeams}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Additional sections for charts and quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
           <div className="text-sm text-gray-500 py-8 border border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-4">
             <Link href="/admin/registrations" className="text-primary hover:text-primary-dark font-medium">Manage Registrations</Link>
             <span className="text-gray-300">|</span>
             <Link href="/admin/employees" className="text-primary hover:text-primary-dark font-medium">Add Employee</Link>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
           <div className="text-sm text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-4">
             <Link href="/admin/network" className="text-primary hover:underline">Network View</Link>
             <span className="text-gray-300">|</span>
             <Link href="/admin/employees" className="text-primary hover:underline">Employees</Link>
             <span className="text-gray-300">|</span>
             <Link href="/admin/sakhi" className="text-primary hover:underline">Sakhi</Link>
           </div>
        </div>
      </div>
    </div>
  );
}
