"use client";

import { useState, useEffect } from "react";
import { Send, AlertCircle, CheckCircle2, Sparkles, Smartphone, Key, Lock, User, Link as LinkIcon, RefreshCw } from "lucide-react";

export default function WhatsAppTestPage() {
  const [activeTab, setActiveTab] = useState<"template4" | "custom">("template4");

  // Template 4 / Approval sequence specific state
  const [t4Data, setT4Data] = useState({
    campaignName: "sample_given1",
    destination: "+91",
    userName: "Amit Sharma",
    loginId: "SAKHI978925",
    password: "Password@123",
    referralCode: "AMIT8760",
    sendSequence: true, // Default to true: sends KYC approved first, then credentials after 12s
  });

  // Custom generic test state
  const [formData, setFormData] = useState({
    campaignName: "sample_given1",
    destination: "+91",
    userName: "Amit Sharma",
    templateParams: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ success?: boolean; error?: string; message?: string; data?: any } | null>(null);

  useEffect(() => {
    document.title = "WhatsApp Notification Test | Amifresh Admin";
  }, []);

  const referralLinkPreview = `https://sakhi.amifresh.in/join?ref=${t4Data.referralCode || "AMIT8760"}`;

  const handleT4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    const rawDest = t4Data.destination.trim();
    const digitsOnly = rawDest.replace(/\D/g, "");
    if (!rawDest || rawDest === "+91" || digitsOnly.length < 10) {
      setResponse({
        success: false,
        error: "Kripya poora 10-digit mobile number dalein (jaise +919876543210 ya 9876543210). Khali '+91' mat chodiye.",
      });
      setLoading(false);
      return;
    }

    const payload = t4Data.sendSequence
      ? {
          isSequence: true,
          destination: t4Data.destination.trim(),
          userName: t4Data.userName.trim(),
          loginId: t4Data.loginId.trim(),
          password: t4Data.password.trim(),
          referralCode: t4Data.referralCode.trim(),
          delayMs: 12000,
        }
      : {
          campaignName: t4Data.campaignName.trim(),
          destination: t4Data.destination.trim(),
          userName: t4Data.userName.trim(),
          templateParams: [
            t4Data.userName.trim(),
            `🔐 User Name - ${t4Data.loginId.trim()}`,
            `🔑 Password - ${t4Data.password.trim()}`,
            referralLinkPreview,
          ],
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

  const handleCustomSubmit = async (e: React.FormEvent) => {
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
      campaignName: formData.campaignName.trim(),
      destination: formData.destination.trim(),
      userName: formData.userName.trim(),
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

  const setPreset = (name: string, campaign: string, userName: string, params: string) => {
    setFormData({
      campaignName: campaign,
      destination: formData.destination,
      userName,
      templateParams: params,
    });
    setActiveTab("custom");
    setResponse(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Send className="text-green-600" />
            WhatsApp API Tester
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Test AiSensy / SmartPing WhatsApp automated campaigns & message templates
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => { setActiveTab("template4"); setResponse(null); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "template4"
                ? "bg-white text-green-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            ✨ Template 4 (Account Created)
          </button>
          <button
            onClick={() => { setActiveTab("custom"); setResponse(null); }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "custom"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Custom Campaign
          </button>
        </div>
      </div>

      {/* Preset Quick Select for other campaigns */}
      <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Quick Presets:</span>
        <button
          onClick={() => setActiveTab("template4")}
          className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <Sparkles size={13} />
          2-Step Approval Flow (KYC + ID/Pass)
        </button>
        <button
          onClick={() => setPreset("KYC Approved", "sakhi_approved1", "Amit Sharma", "Amit Sharma")}
          className="text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Template 2: KYC Approved (sakhi_approved1)
        </button>
        <button
          onClick={() => setPreset("Registration", "sakhi_reg", "Amit Sharma", "Amit Sharma, SAKHI978925")}
          className="text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Template 1: Sakhi Registration Pending (sakhi_reg)
        </button>
        <button
          onClick={() => setPreset("Rejected", "sakhi_failed", "Amit Sharma", "Amit Sharma")}
          className="text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Template 3: Sakhi Rejected (sakhi_failed)
        </button>
        <button
          onClick={() => setPreset("Order", "order_delivred", "Amit Sharma", "Amit Sharma, ORD-12345")}
          className="text-xs bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          Order Delivered (order_delivred)
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === "template4" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="border-b border-gray-100 pb-4 mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={20} />
                Sakhi Account Details Template (4th Template)
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fires automatically when admin approves a registration request.
              </p>
            </div>

            <form onSubmit={handleT4Submit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  AiSensy Campaign Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={t4Data.campaignName}
                    onChange={(e) => setT4Data({ ...t4Data, campaignName: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                    placeholder="sample_given1"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  AiSensy me jo campaign LIVE hai uska exact naam dalein (e.g. <code>sample_given1</code>).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Recipient Mobile Number (With +91)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    value={t4Data.destination}
                    onChange={(e) => setT4Data({ ...t4Data, destination: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                    placeholder="+919891505081"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  10-digit number dalein (jaise: <strong>+919876543210</strong> ya <strong>9876543210</strong>).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Variable 1: User Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      value={t4Data.userName}
                      onChange={(e) => setT4Data({ ...t4Data, userName: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Amit Sharma"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Variable 2: Login ID (User Name)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      value={t4Data.loginId}
                      onChange={(e) => setT4Data({ ...t4Data, loginId: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                      placeholder="SAKHI978925"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Variable 3: Password
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      value={t4Data.password}
                      onChange={(e) => setT4Data({ ...t4Data, password: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                      placeholder="aec387"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Variable 4: Referral Code
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                      type="text"
                      required
                      value={t4Data.referralCode}
                      onChange={(e) => setT4Data({ ...t4Data, referralCode: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
                      placeholder="AMIT8760"
                    />
                  </div>
                </div>
              </div>

              {/* 2-Step Approval Flow Checkbox */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sendSequence"
                  checked={t4Data.sendSequence}
                  onChange={(e) => setT4Data({ ...t4Data, sendSequence: e.target.checked })}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="sendSequence" className="text-xs text-gray-700 cursor-pointer select-none">
                  <span className="font-bold text-emerald-950 block">
                    Full 2-Step Approval Flow (Automated)
                  </span>
                  Pehle turant <strong>KYC Approved Template (`sakhi_approved1`)</strong> jaayega, aur uske <strong>12-15 second baad</strong> yeh <strong>ID & Password Template (`sample_given1`)</strong> jaayega.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex justify-center items-center gap-2 shadow-sm transition-all disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Sending WhatsApp Message(s)...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    {t4Data.sendSequence ? "Test 2-Step Flow (KYC + 12s + Credentials)" : "Send Template 4 Only"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-[#0b141a] text-white p-4 rounded-t-2xl flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                AF
              </div>
              <div>
                <div className="text-sm font-bold">Amifresh Sakhi Official</div>
                <div className="text-[11px] text-gray-300">
                  {t4Data.sendSequence ? "2-Step Approval Messages Preview" : "WhatsApp Notification Preview"}
                </div>
              </div>
            </div>

            <div className="bg-[#efeae2] p-4 rounded-b-2xl border-x border-b border-gray-300 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Message 1 (If Sequence is enabled) */}
                {t4Data.sendSequence && (
                  <div className="bg-white rounded-lg p-3.5 shadow-sm text-gray-800 text-xs whitespace-pre-wrap leading-relaxed max-w-sm border-l-4 border-emerald-500">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Message 1: Sent Immediately</span>
                      <span className="font-mono bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded text-[9px]">sakhi_approved1</span>
                    </div>
                    <div>Hi <span className="font-semibold text-emerald-800">{t4Data.userName || "Amit"}</span>,</div>
                    <br />
                    <div><span className="font-bold">Congratulations!</span> 🎉</div>
                    <br />
                    <div>Your KYC has been successfully approved. <span className="font-bold text-emerald-700">Welcome to the Amifresh Sakhi!</span> 💚</div>
                    <br />
                    <div>You are now ready to <span className="font-bold">start your journey with Amifresh!</span></div>
                    <br />
                    <div>We’re excited to have you with us!</div>
                    <br />
                    <div className="text-xs text-gray-600 font-semibold">Team Amifresh Sakhi!</div>
                    <div className="text-[10px] text-gray-400 text-right mt-1">12:30 PM ✓✓</div>
                  </div>
                )}

                {/* 10-15s delay divider */}
                {t4Data.sendSequence && (
                  <div className="flex items-center justify-center">
                    <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 py-1 px-3 rounded-full shadow-xs flex items-center gap-1.5 border border-emerald-200">
                      <span>⏱️ 12-15 seconds baad second message</span>
                    </div>
                  </div>
                )}

                {/* Message 2 (Account details) */}
                <div className={`bg-white rounded-lg p-3.5 shadow-sm text-gray-800 text-xs whitespace-pre-wrap leading-relaxed max-w-sm ${t4Data.sendSequence ? "border-l-4 border-blue-500" : ""}`}>
                  {t4Data.sendSequence && (
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Message 2: Sent After 12s</span>
                      <span className="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded text-[9px]">{t4Data.campaignName}</span>
                    </div>
                  )}
                  <div>Dear <span className="font-semibold text-emerald-800">{t4Data.userName || "[Name]"}</span>,</div>
                  <br />
                  <div>Your Amifresh Sakhi account details have been created successfully.</div>
                  <br />
                  <div className="font-mono bg-gray-50 p-2 rounded border border-gray-200 text-xs space-y-1">
                    <div>🔐 User Name - <span className="font-bold">{t4Data.loginId || "SAKHI..."}</span></div>
                    <div>🔑 Password - <span className="font-bold">{t4Data.password || "..."}</span></div>
                  </div>
                  <br />
                  <div className="text-xs">
                    🔗 Referral Code/Link:{" "}
                    <span className="text-blue-600 underline font-mono break-all">
                      {referralLinkPreview}
                    </span>
                  </div>
                  <br />
                  <div className="text-xs text-gray-600 font-semibold">Team Amifresh Sakhi!</div>
                  <div className="text-[10px] text-gray-400 text-right mt-1">12:30 PM ✓✓</div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 bg-white/70 p-2.5 rounded-lg border border-gray-200 mt-2">
                <strong>Flow Summary:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 font-mono text-[10px]">
                  <li>Msg 1: <code>sakhi_approved1</code> ({`{{1}}`} = {t4Data.userName})</li>
                  <li>Msg 2: <code>{t4Data.campaignName}</code> (Name, Login ID, Password, Referral Link)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Custom generic campaign tester */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl">
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Name (Must be LIVE in your dashboard)
              </label>
              <input
                type="text"
                required
                value={formData.campaignName}
                onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                placeholder="e.g. sakhi_reg"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
                placeholder="+919876543210"
              />
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="e.g. Amit Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Parameters (comma-separated)
              </label>
              <input
                type="text"
                value={formData.templateParams}
                onChange={(e) => setFormData({ ...formData, templateParams: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                placeholder="Param 1, Param 2, Param 3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Sending..." : "Send Test Message"}
            </button>
          </form>
        </div>
      )}

      {/* Response Box */}
      {response && (
        <div
          className={`p-4 rounded-xl border transition-all ${
            response.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {response.success ? (
              <CheckCircle2 className="text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="text-red-600 mt-0.5" />
            )}

            <div className="flex-1 overflow-hidden">
              <h3 className={`font-semibold text-sm ${response.success ? "text-emerald-900" : "text-red-900"}`}>
                {response.success ? "Message Sent Successfully via WhatsApp!" : "AiSensy / WhatsApp API Error"}
              </h3>

              {response.error && (
                <p className="text-red-700 text-xs mt-1 font-medium">{response.error}</p>
              )}

              {response.data && (
                <div className="mt-2 text-xs bg-black/5 p-3 rounded-lg overflow-x-auto text-gray-800 font-mono">
                  <pre>{JSON.stringify(response.data, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Troubleshooting tips */}
      <div className="bg-blue-50 border border-blue-200/80 p-4 rounded-xl text-xs text-blue-900 space-y-2">
        <h4 className="font-bold flex items-center gap-2 text-blue-950">
          💡 Important Campaign Setup Instructions:
        </h4>
        <ul className="list-disc pl-5 space-y-1.5 text-blue-800">
          <li>
            <strong>Campaign Status:</strong> AiSensy me campaign ka status <strong>Live</strong> hona chahiye. Agar status &quot;Draft&quot; ya &quot;Paused&quot; hai to error <code>Campaign is Not Live (406)</code> aayega.
          </li>
          <li>
            <strong>Variables Mapping (4 Variables):</strong> Is template me AiSensy me 4 parameters mapped hone chahiye:
            <br />
            <code>{`{{1}}`} = Name</code>, <code>{`{{2}}`} = 🔐 User Name - value</code>, <code>{`{{3}}`} = 🔑 Password - value</code>, <code>{`{{4}}`} = https://sakhi.amifresh.in/join?ref=...</code>
          </li>
          <li>
            <strong>Campaign Name in .env:</strong> Agar aapne AiSensy me is campaign ka koi aur naam rakha hai, to aap <code>.env</code> me <code>WHATSAPP_CAMPAIGN_SAKHI_ACCOUNT_CREATED=your_campaign_name</code> likh kar update kar sakte hain.
          </li>
        </ul>
      </div>
    </div>
  );
}
