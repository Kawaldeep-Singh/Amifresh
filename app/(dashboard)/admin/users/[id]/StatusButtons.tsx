'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserStatus } from '@/types/user';
import { changeUserStatus, deleteUser } from '../actions';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

export default function StatusButtons({ userId, currentStatus, isSelf }: { userId: string, currentStatus: UserStatus, isSelf: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (isSelf) {
      alert("You cannot delete your own account.");
      return;
    }

    const confirmed = confirm(
      "⚠️ DANGER / PERMANENT ACTION:\n\nAre you sure you want to PERMANENTLY DELETE this user?\n\nThis will completely remove their account, credentials, and data from the system. This action CANNOT be undone!"
    );
    if (!confirmed) return;

    setLoading(true);
    const res = await deleteUser(userId);
    setLoading(false);

    if (res?.error) {
      alert(res.error);
    } else {
      alert("User has been permanently deleted.");
      router.push('/admin/users');
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
      {!isSelf && (
        <Button 
          variant="danger" 
          onClick={handleDelete}
          isLoading={loading}
          disabled={loading || isSelf}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
        >
          <Trash2 size={15} /> Delete User
        </Button>
      )}
    </div>
  );
}
