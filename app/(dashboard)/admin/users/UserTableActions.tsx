'use client';

import { useState } from 'react';
import { UserStatus } from '@/types/user';
import { Key, Eye, CheckCircle, Ban, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { changeUserStatus, deleteUser } from './actions';

export default function UserTableActions({ userId, userReferralCode, currentStatus, isSelf }: { userId: string, userReferralCode: string, currentStatus: UserStatus, isSelf: boolean }) {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{loginId: string, tempPassword: string} | null>(null);

  const handleDeleteUser = async () => {
    if (isSelf) {
      alert("You cannot delete your own account.");
      return;
    }

    const confirmed = confirm(
      "⚠️ DANGER / ALERT:\n\nAre you sure you want to PERMANENTLY DELETE this user?\n\nThis will completely remove their account, credentials, and data. This action CANNOT be undone!"
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await deleteUser(userId);
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      alert("User has been permanently deleted.");
      window.location.reload();
    }
  };

  const handleStatusChange = async (newStatus: UserStatus) => {
    if (isSelf && newStatus !== UserStatus.ACTIVE) {
      alert("You cannot deactivate or block your own account.");
      return;
    }

    const actionText = newStatus === UserStatus.ACTIVE ? 'activate' : 
                       newStatus === UserStatus.BLOCKED ? 'block' : 
                       'deactivate';
    
    let reason = '';
    if (newStatus === UserStatus.BLOCKED || newStatus === UserStatus.INACTIVE) {
      const input = prompt(`Please enter a reason for ${newStatus === UserStatus.BLOCKED ? 'blocking' : 'deactivating'} this user:`);
      if (input === null) return;
      reason = input;
    } else {
      if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;
    }

    setLoading(true);
    const res = await changeUserStatus(userId, newStatus, reason);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    }
  };

  const handleResetPassword = async () => {
    if (!confirm('Are you sure you want to regenerate the password for this user?')) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setCredentials(data.credentials);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `AmiFresh Password Reset\nYour Login ID: ${credentials.loginId}\nYour Temporary Password: ${credentials.tempPassword}\nPlease login and change your password.`;
    navigator.clipboard.writeText(text);
    alert('Credentials copied to clipboard!');
  };

  return (
    <>
      <div className="flex items-center justify-start gap-1.5">
        <Link href={`/admin/users/${userReferralCode}`} className="text-primary hover:text-primary-dark inline-flex items-center gap-1 bg-primary-light px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium">
          <Eye size={16} /> <span className="hidden sm:inline">View</span>
        </Link>

        {!isSelf && currentStatus !== UserStatus.PENDING && (
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white divide-x divide-gray-200">
            {currentStatus !== UserStatus.ACTIVE && (
              <button 
                onClick={() => handleStatusChange(UserStatus.ACTIVE)}
                disabled={loading}
                className="p-1.5 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                title="Activate User"
              >
                <CheckCircle size={16} />
              </button>
            )}
            {currentStatus !== UserStatus.INACTIVE && (
              <button 
                onClick={() => handleStatusChange(UserStatus.INACTIVE)}
                disabled={loading}
                className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Deactivate User"
              >
                <Clock size={16} />
              </button>
            )}
            {currentStatus !== UserStatus.BLOCKED && (
              <button 
                onClick={() => handleStatusChange(UserStatus.BLOCKED)}
                disabled={loading}
                className="p-1.5 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Block User"
              >
                <Ban size={16} />
              </button>
            )}
            <button 
              onClick={handleResetPassword}
              disabled={loading}
              className="p-1.5 text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
              title="Reset Password"
            >
              <Key size={16} />
            </button>
          </div>
        )}

        {currentStatus === UserStatus.PENDING && (
          <Link href="/admin/registrations" className="text-orange-500 hover:text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium">
            Review
          </Link>
        )}

        {!isSelf && (
          <button
            onClick={handleDeleteUser}
            disabled={loading}
            className="p-1.5 text-red-500 hover:text-white hover:bg-red-600 bg-red-50 rounded-lg transition-colors border border-red-200 disabled:opacity-50"
            title="Permanently Delete User"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {credentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset</h2>
            <p className="text-sm text-gray-600 mb-6 whitespace-normal">
              The user's password has been reset. Please share their new credentials securely.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6">
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase">Login ID</span>
                <div className="font-mono text-lg font-bold text-gray-900">{credentials.loginId}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase">Temporary Password</span>
                <div className="font-mono text-lg font-bold text-gray-900">{credentials.tempPassword}</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={copyCredentials} className="w-full bg-green-600 hover:bg-green-700 text-white">
                Copy to Clipboard
              </Button>
              <Button onClick={() => setCredentials(null)} className="w-full" variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
