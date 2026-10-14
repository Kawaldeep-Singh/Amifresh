'use client';

import { useState } from 'react';
import { Plus, X, Copy, Check, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AddEmployeeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [credentials, setCredentials] = useState<{
    name: string;
    loginId: string;
    email: string;
    tempPassword: string;
  } | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    password: '',
  });

  const router = useRouter();

  const handleOpen = () => {
    setError(null);
    setCredentials(null);
    setForm({
      name: '',
      email: '',
      phone: '',
      designation: '',
      password: '',
    });
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (credentials) {
      router.refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create employee');
      }

      setCredentials({
        name: form.name,
        loginId: data.credentials.loginId,
        email: data.credentials.email,
        tempPassword: data.credentials.tempPassword,
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    if (!credentials) return;
    const text = `AmiFresh Internal Team Credentials\nName: ${credentials.name}\nLogin ID: ${credentials.loginId}\nEmail: ${credentials.email}\nTemporary Password: ${credentials.tempPassword}\nLogin Portal: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md cursor-pointer"
      >
        <Plus size={18} />
        <span>Add Employee</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-gray-100 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary-light">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {credentials ? 'Employee Created!' : 'Add Internal Employee'}
                  </h3>
                  <p className="text-xs text-gray-400">Team / Staff Account Management</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {credentials ? (
                /* Success Screen */
                <div className="space-y-5">
                  <div className="text-center py-2">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck size={32} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {credentials.name} is now an Active Employee!
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Share these temporary credentials with the employee. They will be prompted to change their password on first login.
                    </p>
                  </div>

                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Login ID:</span>
                      <span className="font-mono font-bold text-gray-900 bg-white px-2.5 py-1 rounded border border-emerald-200">
                        {credentials.loginId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Email:</span>
                      <span className="text-gray-900 font-semibold">{credentials.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">Temp Password:</span>
                      <span className="font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded">
                        {credentials.tempPassword}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">System Role:</span>
                      <span className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        INTERNAL TEAM (TEAM)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="button"
                      onClick={copyCredentials}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                      <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Employee Form */
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Work Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="employee@amifresh.in"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Designation / Department (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Operations Manager, Regional Coordinator"
                      value={form.designation}
                      onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-700">
                        Custom Password (Optional)
                      </label>
                      <span className="text-[11px] text-gray-400">Leave blank to auto-generate</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Auto-generated if left empty"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-sm transition-all hover:shadow-md cursor-pointer"
                    >
                      {loading ? 'Creating...' : 'Create Employee'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
