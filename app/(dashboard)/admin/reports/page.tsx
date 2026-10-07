import React from 'react';
import { FileText } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Users', value: '...' },
          { title: 'Active Users', value: '...' },
          { title: 'Referrals', value: '...' },
          { title: 'Registrations', value: '...' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Report</h3>
          <PlaceholderState
            icon={FileText}
            title="Sales Reporting"
            description="Detailed sales reports will be available here."
          />
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Commission Report</h3>
          <PlaceholderState
            icon={FileText}
            title="Commission Reporting"
            description="Detailed commission reports will be available here."
          />
        </div>
      </div>
    </div>
  );
}
