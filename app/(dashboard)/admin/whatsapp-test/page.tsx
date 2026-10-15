"use client";

import { useState } from "react";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

export default function WhatsAppTestPage() {
  const [formData, setFormData] = useState({
    campaignName: "order_delivred",
    destination: "+91",
    userName: "Kawaldeep",
    templateParams: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{success?: boolean; error?: string; data?: any} | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const rawDest = formData.destination.trim();
    const digitsOnly = rawDest.replace(/\D/g, "");
    if (!rawDest || rawDest === "+91" || digitsOnly.length < 10) {
      setResponse({
        success: false,
        error: "Kripya poora 10-digit mobile number dalein (jaise +919876543210 ya 9876543210). Khali '+91' mat chodiye.",
      });
      setLoading(false);
      return;
    }

    const payload = {
      campaignName: formData.campaignName,
      destination: formData.destination,
      userName: formData.userName,
      templateParams: formData.templateParams
        ? formData.templateParams.split(",").map((p) => p.trim()).filter(Boolean)
        : [],
    };

    try {
      const res = await fetch("/api/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Send className="text-green-500" />
        WhatsApp API Tester
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name (Must be LIVE in your dashboard)
            </label>
            <input
              type="text"
              required
              value={formData.campaignName}
              onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g. welcome_message"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number (With +91)
            </label>
            <input
              type="text"
              required
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="+919876543210"
            />
            <p className="text-xs text-gray-500 mt-1">
              Apna 10-digit number dalein (jaise: <strong>+919876543210</strong> ya bina +91 ke <strong>9876543210</strong>).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User Name
            </label>
            <input
              type="text"
              required
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g. Amit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Parameters (Optional, comma-separated)
            </label>
            <input
              type="text"
              value={formData.templateParams}
              onChange={(e) => setFormData({ ...formData, templateParams: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g. Kawaldeep, ORD-12345, Today"
            />
            <p className="text-xs text-gray-500 mt-1">If your campaign has variables like {'{{1}}, {{2}}'}, enter them comma-separated in order.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {loading ? "Sending..." : "Send Test Message"}
          </button>
        </form>

        {response && (
          <div className={`mt-6 p-4 rounded-lg border ${response.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-start gap-3">
              {response.success ? (
                <CheckCircle2 className="text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="text-red-600 mt-0.5" />
              )}
              
              <div className="flex-1 overflow-hidden">
                <h3 className={`font-semibold ${response.success ? 'text-green-800' : 'text-red-800'}`}>
                  {response.success ? 'Message Sent Successfully!' : 'Failed to Send'}
                </h3>
                
                {response.error && (
                  <p className="text-red-600 text-sm mt-1">{response.error}</p>
                )}
                
                {response.data && (
                  <div className="mt-2 text-xs bg-black/5 p-2 rounded overflow-x-auto text-gray-700">
                    <pre>{JSON.stringify(response.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
        <h4 className="font-semibold mb-2 flex items-center gap-2">How to fix "Campaign does not exist" error?</h4>
        <ul className="list-disc pl-5 space-y-1 text-blue-700">
          <li>Login to your WhatsApp API Dashboard (SmartPing/etc).</li>
          <li>Go to the <strong>Campaigns</strong> section.</li>
          <li>Make sure you have created a campaign and its status is <strong>Live</strong>.</li>
          <li>Copy the exact <strong>Campaign Name</strong> and paste it above.</li>
        </ul>
      </div>
    </div>
  );
}
