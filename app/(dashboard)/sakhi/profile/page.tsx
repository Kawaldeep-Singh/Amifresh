import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import QuickViewDocButton from '@/components/documents/QuickViewDocButton';
import { isImageData, getSafeImageSrc } from '@/lib/utils/documentHelper';

export const metadata: Metadata = {
  title: 'My Profile | Amifresh Sakhi',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  await connectDB();
  const user = await User.findById(session.user.id).select('-password');

  if (!user) {
    redirect('/login');
  }

  const isPanImage = isImageData(user.panCard);
  const aadhaarFrontDoc = isImageData(user.aadhaarCardFront)
    ? user.aadhaarCardFront
    : (isImageData(user.aadhaarCard) ? user.aadhaarCard : null);
  const aadhaarBackDoc = isImageData(user.aadhaarCardBack) ? user.aadhaarCardBack : null;
  const isAadhaarImage = Boolean(aadhaarFrontDoc || aadhaarBackDoc);

  const aadhaarDocs = [
    ...(aadhaarFrontDoc ? [{
      id: 'aadhaar_front',
      title: 'Aadhaar Card (Front)',
      src: getSafeImageSrc(aadhaarFrontDoc),
      subtitle: `${user.name}'s Aadhaar Card (Front Side)`
    }] : []),
    ...(aadhaarBackDoc ? [{
      id: 'aadhaar_back',
      title: 'Aadhaar Card (Back)',
      src: getSafeImageSrc(aadhaarBackDoc),
      subtitle: `${user.name}'s Aadhaar Card (Back Side)`
    }] : [])
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your personal information and settings.
          </p>
        </div>
        <Link 
          href="/change-password"
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <ShieldAlert className="w-4 h-4 mr-2" />
          Change Password
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Personal Details</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">{user.name || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Father/Spouse Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.fatherSpouseName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.dob || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.address ? `${user.address}, ${user.city || ''}, ${user.state || ''} - ${user.pinCode || ''}` : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Identity & Account */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Identity & Account</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.phone || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">PAN Card</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center justify-between gap-2">
                    {isPanImage ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          Document Uploaded
                        </span>
                        <QuickViewDocButton
                          docValue={user.panCard}
                          docTitle="PAN Card"
                          userName={user.name}
                          buttonText="View PAN"
                          variant="button"
                        />
                      </>
                    ) : (
                      <span className="font-mono uppercase">{user.panCard || 'N/A'}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Aadhaar Card</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex flex-wrap items-center justify-between gap-2">
                    {isAadhaarImage ? (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          Document Uploaded
                        </span>
                        <div className="flex items-center gap-2">
                          {aadhaarFrontDoc && (
                            <QuickViewDocButton
                              docValue={aadhaarFrontDoc}
                              docTitle="Aadhaar Card (Front)"
                              userName={user.name}
                              buttonText="View Front"
                              variant="button"
                              documents={aadhaarDocs}
                              initialDocId="aadhaar_front"
                            />
                          )}
                          {aadhaarBackDoc && (
                            <QuickViewDocButton
                              docValue={aadhaarBackDoc}
                              docTitle="Aadhaar Card (Back)"
                              userName={user.name}
                              buttonText="View Back"
                              variant="button"
                              documents={aadhaarDocs}
                              initialDocId="aadhaar_back"
                            />
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="font-mono">{user.aadhaarCard || 'N/A'}</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role & Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 flex items-center space-x-2">
                    <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                    <span className="px-2 py-0.5 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {user.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Joined Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
