import React from 'react';
import { IndianRupee } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export default function AdminCommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
      </div>
      <PlaceholderState
        icon={IndianRupee}
        title="Commission Management"
        description="Commission functionality will be enabled in a future phase. Here you will be able to review calculated payouts, manage withdrawals, and track multi-level earnings."
      />
    </div>
  );
}
