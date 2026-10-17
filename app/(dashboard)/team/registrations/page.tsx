import React from 'react';
import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export const metadata: Metadata = {
  title: 'Team Registrations | Amifresh Team',
};

export default function ManagerRegistrationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Registrations</h1>
      </div>
      <PlaceholderState
        icon={UserPlus}
        title="Pending Sakhi"
        description="Pending team registrations will appear here for your review and approval in a future update."
      />
    </div>
  );
}
