import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Users, ShoppingCart, IndianRupee, Activity } from 'lucide-react';
import { getMemberDashboardStats } from '@/services/dashboard.service';
import ReferralLink from '@/components/dashboard/ReferralLink';

export default async function MemberDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const stats = await getMemberDashboardStats(session.user.id);

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">Welcome, {session.user.name}!</h1>
      <p className="text-sm text-gray-600 mt-1">
        Here&apos;s what&apos;s happening with your account and network today.
      </p>

      <div className="mt-8">
        <ReferralLink referralCode={session.user.referralCode} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Network</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalNetwork}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">My Sales</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalSales}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <IndianRupee size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Commission</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats.totalCommission}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <p className="text-xl font-bold text-gray-900 capitalize">{stats.status.toLowerCase()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
