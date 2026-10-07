'use client';

import { Copy } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ReferralLink({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const copyToClipboard = () => {
    if (typeof window === 'undefined') return;
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h2>
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-sm text-gray-700 truncate">
          {typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${referralCode}` : 'Loading...'}
        </div>
        <button 
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
        >
          <Copy size={16} />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}
