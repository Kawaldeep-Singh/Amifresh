'use client';

import { useState } from 'react';
import { UserStatus } from '@/types/user';
import { changeUserStatus } from '../actions';
import { Button } from '@/components/ui/Button';

export default function StatusButtons({ userId, currentStatus, isSelf }: { userId: string, currentStatus: UserStatus, isSelf: boolean }) {
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
    <div className="flex flex-wrap gap-2">
      {currentStatus !== UserStatus.ACTIVE && (
        <Button 
          variant="primary" 
          onClick={() => handleStatusChange(UserStatus.ACTIVE)}
          isLoading={loading}
          disabled={loading || isSelf}
          className="bg-green-600 hover:bg-green-700"
        >
          Activate
        </Button>
      )}
      {currentStatus !== UserStatus.INACTIVE && (
        <Button 
          variant="outline" 
          onClick={() => handleStatusChange(UserStatus.INACTIVE)}
          isLoading={loading}
          disabled={loading || isSelf}
        >
          Deactivate
        </Button>
      )}
      {currentStatus !== UserStatus.BLOCKED && (
        <Button 
          variant="danger" 
          onClick={() => handleStatusChange(UserStatus.BLOCKED)}
          isLoading={loading}
          disabled={loading || isSelf}
        >
          Block
        </Button>
      )}
    </div>
  );
}
