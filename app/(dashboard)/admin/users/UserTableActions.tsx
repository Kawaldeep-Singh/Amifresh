'use client';

import { useState } from 'react';
import { UserStatus } from '@/types/user';
import { changeUserStatus } from './actions';
import { Eye, CheckCircle, Ban, Clock } from 'lucide-react';
import Link from 'next/link';

export default function UserTableActions({ userId, userReferralCode, currentStatus, isSelf }: { userId: string, userReferralCode: string, currentStatus: UserStatus, isSelf: boolean }) {
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/users/${userReferralCode}`} className="text-primary hover:text-primary-dark inline-flex items-center gap-1 bg-primary-light px-2.5 py-1.5 rounded-lg transition-colors text-xs font-medium">
        <Eye size={16} /> <span className="hidden sm:inline">View</span>
      </Link>

      {!isSelf && (
        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden ml-1 bg-white">
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
              className="p-1.5 text-gray-500 hover:bg-gray-100 transition-colors border-l border-r border-gray-200 disabled:opacity-50"
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
        </div>
      )}
    </div>
  );
}
