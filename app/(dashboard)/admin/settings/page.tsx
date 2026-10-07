import React from 'react';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <button disabled className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 flex items-center">
          <Save size={18} className="mr-2" />
          Save Changes
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input type="text" disabled defaultValue="Amifresh" className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select disabled className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500">
                <option>INR (₹)</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2 mt-8">Registration Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" disabled defaultChecked className="h-4 w-4 text-primary rounded border-gray-300" />
              <label className="ml-2 block text-sm text-gray-900">
                Require Admin Approval for new registrations
              </label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" disabled defaultChecked className="h-4 w-4 text-primary rounded border-gray-300" />
              <label className="ml-2 block text-sm text-gray-900">
                Enable Referral System
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 text-sm text-gray-500 flex items-center">
          <Settings size={16} className="mr-2" />
          Settings management will be fully activated in a future phase.
        </div>
      </div>
    </div>
  );
}
