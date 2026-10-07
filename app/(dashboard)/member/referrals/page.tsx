import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@/types/user';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Users, Link as LinkIcon, Network } from 'lucide-react';
import ReferralLink from '@/components/dashboard/ReferralLink';

export const metadata: Metadata = {
  title: 'My Referrals | Amifresh',
};

export default async function MemberReferralsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== UserRole.MEMBER) {
    redirect('/login');
  }

  await connectDB();

  const currentUser = await User.findById(session.user.id).populate('referredBy', 'name referralCode');
  
  if (!currentUser) {
    redirect('/login');
  }

  const directReferrals = await User.find({ referredBy: currentUser._id })
    .select('name email phone status createdAt referralCode')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="text-primary" />
          My Referrals
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          View your direct referrals and referral information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2">
              <LinkIcon size={20} className="text-primary" />
              Referral Link
            </h2>
            <ReferralLink referralCode={currentUser.referralCode} />
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 border-b pb-2">
              <Network size={20} className="text-primary" />
              My Referrer
            </h2>
            {currentUser.referredBy ? (
              <div>
                <div className="font-medium text-gray-900">{(currentUser.referredBy as any).name}</div>
                <div className="text-sm text-gray-500 font-mono mt-1">Code: {(currentUser.referredBy as any).referralCode}</div>
              </div>
            ) : (
              <div className="text-gray-500 italic text-sm">You joined without a referrer.</div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-semibold mb-2">Direct Referrals Count</h2>
            <div className="text-3xl font-bold text-primary">{directReferrals.length}</div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-semibold text-gray-800">Recent Direct Referrals</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {directReferrals.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                        You haven&apos;t referred anyone yet. Share your code to get started!
                      </td>
                    </tr>
                  ) : directReferrals.map((ref: any) => (
                    <tr key={ref._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{ref.name}</div>
                        <div className="text-sm text-gray-500 font-mono">Code: {ref.referralCode}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ref.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          ref.status === 'BLOCKED' ? 'bg-red-100 text-red-800' :
                          ref.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ref.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
