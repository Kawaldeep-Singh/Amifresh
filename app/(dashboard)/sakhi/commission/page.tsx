import React from 'react';
import { IndianRupee } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export default function MemberCommissionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Commission</h1>
      </div>
      <PlaceholderState
        icon={IndianRupee}
        title="Commission Tracking"
        description="Your commissions and payouts will be available here in a future phase."
      />
    </div>
  );
}
