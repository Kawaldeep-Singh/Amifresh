'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Network, User as UserIcon, Copy, Check } from 'lucide-react';

// Basic recursive component to display the tree
const TreeNode = ({ node }: { node: any }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="ml-6 mt-2">
      <div className="flex items-center gap-2">
        {node.children && node.children.length > 0 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded-sm text-gray-600 font-bold hover:bg-gray-300 transition-colors text-xs"
          >
            {expanded ? '-' : '+'}
          </button>
        )}
        <div className="flex items-center bg-white border border-gray-200 p-2 rounded-lg shadow-sm w-64 hover:border-primary cursor-default transition-colors">
          <div className="h-8 w-8 bg-primary-light text-primary rounded-full flex items-center justify-center mr-3 shrink-0">
            <UserIcon size={16} />
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold text-gray-800 truncate" title={node.name}>{node.name}</p>
            <p className="text-xs text-gray-500">Ref: <span className="font-mono text-primary">{node.referralCode}</span></p>
          </div>
        </div>
      </div>
      
      {expanded && node.children && (
        <div className="border-l-2 border-gray-200 ml-2.5 pt-2">
          {node.children.map((child: any) => (
            <TreeNode key={child._id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function SakhiNetworkPage() {
  const { data: session } = useSession();
  const [treeData, setTreeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/referrals/${session.user.id}/tree`)
        .then(res => res.json())
        .then(data => {
          if (data.error) setError(data.error);
          else setTreeData(data.tree);
        })
        .catch(err => setError('Failed to load network tree'))
        .finally(() => setLoading(false));
    }
  }, [session]);

  const referralLink = typeof window !== 'undefined' && treeData 
    ? `${window.location.origin}/register?ref=${treeData.referralCode}`
    : '';

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Network className="text-primary" />
          My Network Tree
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Visual representation of your referred sakhis and their downline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Referral Link</h2>
            
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-10 rounded w-full"></div>
            ) : error ? (
              <p className="text-sm text-red-500">Unable to load code</p>
            ) : treeData ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Your Referral Code</label>
                  <div className="bg-primary-light border border-primary-light text-primary-dark font-mono text-lg font-bold py-2 px-4 rounded-lg text-center">
                    {treeData.referralCode}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Shareable Link</label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md text-sm border-gray-300 bg-gray-50 text-gray-500 focus:ring-0 focus:border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <h2 className="text-lg font-semibold text-gray-900 mb-2">Network Stats</h2>
             {loading ? (
                <div className="animate-pulse bg-gray-200 h-16 rounded w-full"></div>
             ) : treeData ? (
               <div className="space-y-4 mt-4">
                 <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Direct Referrals</span>
                    <span className="font-semibold text-gray-900">{treeData.children?.length || 0}</span>
                 </div>
               </div>
             ) : null}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px] overflow-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tree View</h2>
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            
            {error && (
              <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {!loading && !error && treeData && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 inline-block min-w-full pb-10">
                <TreeNode node={treeData} />
              </div>
            )}

            {!loading && !error && !treeData && (
              <div className="text-center text-gray-500 p-8">
                You don&apos;t have anyone in your network yet. Start sharing your referral code!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
