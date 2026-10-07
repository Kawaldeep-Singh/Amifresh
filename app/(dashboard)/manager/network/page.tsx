import React from 'react';
import { Network } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export default function ManagerNetworkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Network Topology</h1>
      </div>
      <PlaceholderState
        icon={Network}
        title="Network Viewer"
        description="A visual representation of your entire referral network will be available here."
      />
    </div>
  );
}
