import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>
      <PlaceholderState
        icon={ShoppingCart}
        title="Order Management"
        description="Order functionality will be enabled in a future phase. Here you will be able to manage all customer orders, track fulfillment, and review sales history."
      />
    </div>
  );
}
