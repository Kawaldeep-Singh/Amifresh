import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, UserPlus } from 'lucide-react';
import { getAdminDashboardStats } from '@/services/dashboard.service';
import { UserRole } from '@/models/User';
import Link from 'next/link';

export default async function AdminDashboard() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
        <Link href="/admin/users" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-primary transition-colors hover:shadow-md cursor-pointer block group">
          <div className="h-12 w-12 bg-primary-light text-primary rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </Link>
        
        <Link href="/admin/users?role=MEMBER&status=ACTIVE" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-green-500 transition-colors hover:shadow-md cursor-pointer block group">
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Members</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
          </div>
        </Link>

        <Link href="/admin/users?role=MANAGER" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-blue-500 transition-colors hover:shadow-md cursor-pointer block group">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Managers</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalManagers}</p>
          </div>
        </Link>
        
        <Link href="/admin/registrations" className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 hover:border-yellow-500 transition-colors hover:shadow-md cursor-pointer block group">
          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Registrations</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
          </div>
        </Link>
      </div>
      
      {/* Additional sections for charts and recent activities would go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">System Actions</h3>
           <div className="text-sm text-gray-500 py-8 border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
             <a href="/admin/registrations" className="text-primary hover:text-primary-dark font-medium">Manage Registrations</a>
           </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
           <div className="text-sm text-gray-500 text-center py-8 border border-dashed border-gray-200 rounded-lg space-x-4">
             <a href="/admin/network" className="text-primary hover:underline">Network View</a>
             <a href="/admin/users" className="text-primary hover:underline">User Management</a>
           </div>
        </div>
      </div>
    </div>
  );
}
