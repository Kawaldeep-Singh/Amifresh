import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { PlaceholderState } from '@/components/ui/PlaceholderState';

export default function MemberOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      </div>
      <PlaceholderState
        icon={ShoppingCart}
        title="My Orders"
        description="Your order history will appear here once the store functionality is enabled in a future phase."
      />
    </div>
  );
}
