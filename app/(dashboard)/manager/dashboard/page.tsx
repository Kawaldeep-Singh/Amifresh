import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, UserPlus, ShoppingCart, IndianRupee } from 'lucide-react';
import { getAdminDashboardStats } from '@/services/dashboard.service';
import { UserRole } from '@/models/User';

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user.role !== UserRole.MANAGER && session.user.role !== UserRole.ROOT_ADMIN)) {
    redirect('/login');
  }

  // Managers might see similar stats to admin or slightly restricted.
  // For now, we reuse the same service since requirements don't isolate them yet.
  const stats = await getAdminDashboardStats();

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
      <p className="text-sm text-gray-600 mt-1">
        Overview of system activity and registrations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-primary-light text-primary rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending Registrations</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingRegistrations}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900">₹0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Commissions</p>
            <p className="text-2xl font-bold text-gray-900">₹0</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
           <div className="text-sm text-gray-500 py-8 border border-dashed border-gray-200 rounded-lg flex items-center justify-center">
             <a href="/manager/registrations" className="text-primary hover:text-primary-dark font-medium">Review Registrations</a>
           </div>
        </div>
      </div>
    </div>
  );
}
