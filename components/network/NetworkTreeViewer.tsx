'use client';

import { useEffect, useState } from 'react';
import { User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const TreeNode = ({ node, viewerRole }: { node: any, viewerRole: string }) => {
  const [expanded, setExpanded] = useState(true);

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'ROOT_ADMIN': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'TEAM': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  // Determine destination link based on viewer role
  const getProfileLink = () => {
    if (viewerRole === 'ROOT_ADMIN') {
      return `/admin/users/${node.referralCode}`;
    }
    // For team/sakhi, we might not want them to click into profiles of their downline,
    // or maybe we just don't make it a link if they are not admin.
    return null;
  };

  const profileLink = getProfileLink();

  const NodeContent = () => (
    <div className={`group block bg-white border p-3 rounded-xl shadow-sm w-72 relative ${node.status !== 'ACTIVE' ? 'border-red-200 bg-red-50' : 'border-gray-200'} ${profileLink ? 'hover:border-primary hover:shadow-md transition-all cursor-pointer' : ''}`}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 border ${getRoleColor(node.role)}`}>
          <UserIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <p className="text-sm font-bold text-gray-900 truncate" title={node.name}>{node.name}</p>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${getRoleColor(node.role)}`}>
              {node.role === 'ROOT_ADMIN' ? 'Admin' : node.role === 'TEAM' ? 'Team' : 'Sakhi'}
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
    </div>
  );

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
        
        {profileLink ? (
          <Link href={profileLink}>
            <NodeContent />
          </Link>
        ) : (
          <NodeContent />
        )}
      </div>
      
      {expanded && node.children && (
        <div className="border-l border-gray-300 ml-[9px] relative pb-2">
          {node.children.map((child: any) => (
            <TreeNode key={child._id} node={child} viewerRole={viewerRole} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function NetworkTreeViewer({ userId }: { userId?: string }) {
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { data: session } = useSession();
  const [totalSakhi, setTotalSakhi] = useState(0);
  const [totalNetwork, setTotalNetwork] = useState(0);

  useEffect(() => {
    const targetId = userId || session?.user?.id;
    if (!targetId) return;

    fetch(`/api/referrals/${targetId}/tree`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else {
          const tree = data.tree;
          setTreeData(tree ? [tree] : []);
          
          if (tree) {
            let sCount = 0;
            let tCount = 0;
            const traverse = (node: any) => {
              if (node.role === 'SAKHI' || node.role === 'MEMBER') sCount++;
              tCount++;
              if (node.children) {
                node.children.forEach(traverse);
              }
            };
            if (tree.children) {
              tree.children.forEach(traverse);
            }
            setTotalSakhi(sCount);
            setTotalNetwork(tCount);
          }
        }
      })
      .catch(err => setError('Failed to load network tree'))
      .finally(() => setLoading(false));
  }, [userId, session?.user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-200">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p>Loading network topology...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-800">Error Loading Network</h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <UserIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No Network Data</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          There is no downline network associated with this account yet.
        </p>
      </div>
    );
  }

  const viewerRole = session?.user?.role || 'MEMBER';

  return (
    <div className="space-y-4">
      {/* Top right stats */}
      <div className="flex justify-end gap-4">
        <div className="bg-white px-5 py-2.5 rounded-xl shadow-sm border border-gray-200 flex gap-6">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Total Network</p>
            <p className="text-xl font-bold text-gray-900 leading-none">{totalNetwork}</p>
          </div>
          <div className="w-px bg-gray-200"></div>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Total Sakhi</p>
            <p className="text-xl font-bold text-primary leading-none">{totalSakhi}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-200 overflow-x-auto min-h-[400px]">
        <div className="min-w-max pb-8">
          {treeData.map((tree: any) => (
            <div key={tree._id} className="-ml-8">
              <TreeNode node={tree} viewerRole={viewerRole} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
