import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import { getUserById } from '@/services/user.service';
import { getDirectReferrals } from '@/services/referral.service';
import Link from 'next/link';
import { ArrowLeft, User, Shield, Network, Calendar, Phone, Mail } from 'lucide-react';
import StatusButtons from './StatusButtons';

export const metadata: Metadata = {
  title: 'User Details | Amifresh Admin',
};

export default async function AdminUserDetailsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.ROOT_ADMIN) {
    redirect('/login');
  }

  await connectDB();

  const user = await getUserById(resolvedParams.id);
  if (!user) {
    notFound();
  }

  const directReferrals = await getDirectReferrals(user._id.toString());
  const isSelf = session.user.id === user._id.toString();

  // Helper to get initials
  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BLOCKED': return 'bg-red-100 text-red-800 border-red-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Navigation */}
      <div className="flex items-center gap-4 mb-2">
        <Link href="/admin/users" className="p-2 border rounded-full bg-white hover:bg-gray-50 text-gray-600 shadow-sm transition-all hover:shadow">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
      </div>

      {/* Profile Banner & Info */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden relative">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary-dark"></div>
        
        <div className="px-6 sm:px-10 pb-8 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-4xl font-bold text-white">
                {initials}
              </div>
            </div>
            
            {/* Primary Info */}
            <div className="flex-1 text-center sm:text-left space-y-1 mt-4 sm:mt-0">
              <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-gray-600 font-medium">
                <span className="flex items-center gap-1.5"><Mail size={16}/> {user.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={16}/> {user.phone}</span>
                <span className="flex items-center gap-1.5"><Calendar size={16}/> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="shrink-0">
              <span className={`px-4 py-1.5 inline-flex text-sm font-bold rounded-full border ${getStatusColor(user.status)} shadow-sm`}>
                {user.status}
              </span>
            </div>
          </div>

          {/* Quick Actions / Status Remark */}
          <div className="bg-gray-50 p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Manage Account Status</div>
              <StatusButtons userId={user._id.toString()} currentStatus={user.status} isSelf={isSelf} />
              {isSelf && <p className="text-xs text-red-500 mt-2">You cannot change your own status.</p>}
            </div>
            {user.statusRemark && user.status !== 'ACTIVE' && (
              <div className="md:max-w-md bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                <p className="text-sm text-red-800"><span className="font-bold">Status Remark:</span> {user.statusRemark}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Meta */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6 text-gray-800">
              <Shield size={20} className="text-primary" />
              Account details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500 text-sm">Role</span>
                <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-md text-xs tracking-wide">{user.role}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500 text-sm">Referral Code</span>
                <span className="font-mono font-bold text-primary-dark bg-primary-light/30 px-3 py-1 rounded-md">{user.referralCode}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500 text-sm">Direct Referrals</span>
                <span className="font-bold text-gray-900 text-lg">{user.directReferralCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-gray-500 text-sm">Network Size</span>
                <span className="font-bold text-gray-900 text-lg">{user.networkCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-800">
              <Network size={20} className="text-primary" />
              Referred By
            </h3>
            {user.referredBy ? (
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between group hover:bg-primary/10 transition-colors">
                <div>
                  <div className="font-semibold text-gray-900">{user.referredBy.name}</div>
                  <div className="text-sm font-mono text-gray-500">{user.referredBy.referralCode}</div>
                </div>
                <Link href={`/admin/users/${user.referredBy.referralCode}`} className="text-primary font-medium text-sm hover:underline group-hover:translate-x-1 transition-transform">
                  View &rarr;
                </Link>
              </div>
            ) : (
              <div className="text-gray-500 italic p-4 rounded-xl border bg-gray-50 text-center">
                Joined organically (No referrer)
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tables */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <User size={20} className="text-primary" />
                Direct Referrals
              </h3>
              <span className="text-sm text-gray-500 font-medium">Total: {directReferrals.length}</span>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-gray-200">
              {directReferrals.length === 0 ? (
                <div className="text-gray-500 italic py-10 text-center bg-gray-50">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-200 text-gray-400 mb-3">
                    <User size={24} />
                  </div>
                  <p>No direct referrals yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {directReferrals.map((ref: any) => (
                        <tr key={ref._id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-semibold text-gray-900">{ref.name}</div>
                            <div className="text-xs text-gray-500 font-mono mt-0.5">{ref.referralCode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 inline-flex text-[11px] leading-5 font-bold rounded-full border ${getStatusColor(ref.status)}`}>
                              {ref.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                            {new Date(ref.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <Link href={`/admin/users/${ref.referralCode}`} className="inline-flex items-center justify-center px-3 py-1.5 border border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:text-primary transition-colors shadow-sm">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
