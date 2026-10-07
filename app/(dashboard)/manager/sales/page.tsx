import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export default function ManagerSalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
      </div>
      <PlaceholderState
        icon={ShoppingCart}
        title="Sales Tracking"
        description="Sales tracking for your team will be available in a future phase."
      />
    </div>
  );
}
