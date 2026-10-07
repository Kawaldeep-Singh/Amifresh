'use client';

import { useEffect, useState } from 'react';
import { Network, User as UserIcon, Copy, Check, Search } from 'lucide-react';

import Link from 'next/link';

const TreeNode = ({ node }: { node: any }) => {
  const [expanded, setExpanded] = useState(true);

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'ROOT_ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'MANAGER': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  return (
    <div className="ml-8 mt-4 relative">
      {/* Connecting lines */}
      <div className="absolute -left-4 top-6 w-4 h-px bg-gray-300"></div>
      
      <div className="flex items-start gap-2">
        {node.children && node.children.length > 0 && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="w-5 h-5 mt-3 flex items-center justify-center bg-white border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-50 transition-colors text-xs z-10 relative shadow-sm"
          >
            {expanded ? '-' : '+'}
          </button>
        )}
        {!node.children || node.children.length === 0 ? <div className="w-5 h-5 mt-3"></div> : null}
        
        <Link 
          href={`/admin/users/${node.referralCode}`}
          className={`group block bg-white border p-3 rounded-xl shadow-sm w-72 hover:border-primary hover:shadow-md transition-all relative ${node.status !== 'ACTIVE' ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${getRoleColor(node.role)}`}>
              <UserIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-gray-900 truncate" title={node.name}>{node.name}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${getRoleColor(node.role)}`}>
                  {node.role === 'ROOT_ADMIN' ? 'Admin' : node.role === 'MANAGER' ? 'Manager' : 'Member'}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate" title={node.email}>{node.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2 mt-2">
            <div>
              <span className="text-gray-400 block">Code</span>
              <span className="font-mono font-medium text-primary">{node.referralCode}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Sales</span>
              <span className="font-medium text-green-600">₹{node.totalSales?.toLocaleString() || 0}</span>
            </div>
          </div>

          {node.children && node.children.length > 0 && (
             <div className="absolute -right-2 -top-2 bg-gray-900 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-sm">
               {node.children.length}
             </div>
          )}
        </Link>
      </div>
      
      {expanded && node.children && (
        <div className="border-l border-gray-300 ml-[9px] relative pb-2">
          {node.children.map((child: any) => (
            <TreeNode key={child._id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function AdminNetworkClient() {
  const [treesData, setTreesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/referrals/global')
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setTreesData(data.trees || []);
      })
      .catch(err => setError('Failed to load global network tree'))
      .finally(() => setLoading(false));
  }, []);

  // Deep recursive client-side filtering by name, phone, or referral code
  const filterTree = (node: any, query: string): any | null => {
    if (!query) return node;

    const q = query.toLowerCase();
    const isMatch = 
      (node.name && node.name.toLowerCase().includes(q)) ||
      (node.referralCode && node.referralCode.toLowerCase().includes(q)) ||
      (node.phone && node.phone.toLowerCase().includes(q));

    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map((child: any) => filterTree(child, query))
        .filter((child: any) => child !== null);

      if (isMatch) {
        return node; // Node matches, keep entire subtree
      } else if (filteredChildren.length > 0) {
        return { ...node, children: filteredChildren }; // Child matches, keep path
      } else {
        return null;
      }
    }

    return isMatch ? node : null;
  };

  const filteredTrees = treesData
    .map(tree => filterTree(tree, searchQuery))
    .filter(tree => tree !== null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="text-primary" />
            Global Network Viewer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete visual representation of all referral trees in the system.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search network by name, phone, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[500px] overflow-auto">
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

        {!loading && !error && filteredTrees.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 inline-block min-w-full pb-10 space-y-8">
            {filteredTrees.map((tree: any) => (
              <div key={tree._id} className="pb-4 border-b border-gray-200 last:border-0">
                <TreeNode node={tree} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filteredTrees.length === 0 && (
          <div className="text-center text-gray-500 p-8">
            No network trees found.
          </div>
        )}
      </div>
    </div>
  );
}
