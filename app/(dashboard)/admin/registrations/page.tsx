'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { UserPlus, Check, X } from 'lucide-react';

export default function RegistrationsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('PENDING');

  const fetchRequests = async (status: string) => {
    try {
      const res = await fetch(`/api/registrations?status=${status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setRequests(data.requests);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      // Small delay to prevent synchronous setState warning in effect
      await new Promise(r => setTimeout(r, 0));
      if (!isMounted) return;
      setLoading(true);
      await fetchRequests(statusFilter);
    };
    load();
    return () => { isMounted = false; };
  }, [statusFilter]);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    let reason = '';
    if (action === 'REJECT') {
      const input = prompt('Please enter a reason for rejection (min 5 chars):');
      if (input === null) return;
      if (input.trim().length < 5) {
        alert('Reason must be at least 5 characters');
        return;
      }
      reason = input;
    }

    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this registration?`)) return;

    setProcessingId(id);
    try {
      const res = await fetch(`/api/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      alert(data.message);
      fetchRequests(statusFilter);
    } catch (err: any) {
      alert(err.message || `Failed to ${action.toLowerCase()} registration`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="text-primary" />
            Registration Requests
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Review and manage new member signups.
          </p>
        </div>
        
        <div className="flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                statusFilter === status 
                  ? 'bg-primary-light border-primary-light text-primary-dark' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading registrations...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No {statusFilter.toLowerCase()} registration requests at the moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referrer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date / Status</th>
                  {statusFilter === 'PENDING' && (
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{req.name}</div>
                      <div className="text-sm text-gray-500">Code Used: {req.referralCode || 'None'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{req.email}</div>
                      <div className="text-sm text-gray-500">{req.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{req.referrer?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{req.referrer?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                      <div className={`mt-1 font-medium ${
                        req.status === 'PENDING' ? 'text-yellow-600' :
                        req.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {req.status}
                      </div>
                      {req.status === 'REJECTED' && req.rejectionReason && (
                        <div className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={req.rejectionReason}>
                          {req.rejectionReason}
                        </div>
                      )}
                    </td>
                    {statusFilter === 'PENDING' && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          isLoading={processingId === req._id}
                          disabled={processingId !== null}
                          onClick={() => handleAction(req._id, 'APPROVE')}
                        >
                          <Check size={16} className="mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          isLoading={processingId === req._id}
                          disabled={processingId !== null}
                          onClick={() => handleAction(req._id, 'REJECT')}
                        >
                          <X size={16} className="mr-1" /> Reject
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
