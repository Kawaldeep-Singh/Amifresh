import React from 'react';
import type { Metadata } from 'next';
import { Network } from 'lucide-react';
import NetworkTreeViewer from '@/components/network/NetworkTreeViewer';

export const metadata: Metadata = {
  title: 'Team Network Tree | Amifresh Team',
};

export default function TeamNetworkPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Network className="text-primary" />
          Network Topology
        </h1>
      </div>
      
      {/* We don't pass userId here, the API defaults to the current session user */}
      <NetworkTreeViewer />
    </div>
  );
}
