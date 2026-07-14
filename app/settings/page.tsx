"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getApiKey, saveApiKey, removeApiKey, validateApiKey } from "@/lib/gemini";
import { ArrowLeft, Key, Trash2, CheckCircle2, Loader2, ExternalLink, Shield } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [newKey, setNewKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/");
    setCurrentKey(getApiKey());
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!newKey.trim()) { setError("Please enter an API key."); return; }
    setValidating(true); setError(""); setSuccess("");
    try {
      const valid = await validateApiKey(newKey.trim());
      if (!valid) { setError("Invalid API key. Please check and try again."); return; }
      saveApiKey(newKey.trim());
      setCurrentKey(newKey.trim());
      setNewKey("");
      setSuccess("API key saved successfully!");
    } catch { setError("Could not validate. Check your connection."); }
    finally { setValidating(false); }
  };

  const handleRemove = () => {
    removeApiKey();
    setCurrentKey(null);
    setSuccess("API key removed.");
  };

  const maskKey = (key: string) => key.slice(0, 8) + "••••••••••••••••" + key.slice(-4);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-bold text-slate-900">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {/* API Key Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <Key className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Gemini API Key</h2>
              <p className="text-xs text-slate-500">Stored locally in your browser only</p>
            </div>
          </div>

          {currentKey && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-green-800 font-mono">{maskKey(currentKey)}</span>
              </div>
              <button onClick={handleRemove} className="text-red-500 hover:text-red-700 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">{currentKey ? "Replace API Key" : "Add API Key"}</label>
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-violet-600 flex items-center gap-1 hover:underline">
                  Get free key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <input type="password" value={newKey} onChange={e => { setNewKey(e.target.value); setError(""); setSuccess(""); }}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono" />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            {success && <p className="text-green-600 text-xs">{success}</p>}
            <button onClick={handleSave} disabled={validating || !newKey.trim()}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm">
              {validating ? <><Loader2 className="w-4 h-4 animate-spin" />Validating...</> : "Save API Key"}
            </button>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">How your API key is stored</h3>
              <ul className="text-xs text-slate-500 space-y-1">
                <li>• Stored only in your browser's localStorage</li>
                <li>• Never sent to our servers or database</li>
                <li>• Each device requires its own key entry</li>
                <li>• Clearing browser data will remove the key</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Share Link untuk Ortu */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-1">Parent Monitoring Link</h3>
          <p className="text-xs text-slate-500 mb-3">Bagikan link ini ke orang tua kamu. Mereka bisa pantau progress tanpa perlu login.</p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 flex items-center gap-2">
            <code className="text-xs text-violet-700 flex-1 break-all">
              {typeof window !== "undefined" ? `${window.location.origin}/shared/${user?.uid}` : "Loading..."}
            </code>
            <button
              onClick={() => {
                const url = `${window.location.origin}/shared/${user?.uid}`;
                navigator.clipboard.writeText(url);
                setSuccess("Link copied to clipboard!");
                setTimeout(() => setSuccess(""), 2000);
              }}
              className="text-xs bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg font-medium whitespace-nowrap">
              Copy
            </button>
          </div>
          <p className="text-xs text-slate-400">💡 Orang tua bookmark link ini sekali → bisa pantau kapanpun tanpa lo perlu share ulang.</p>
        </div>

        {/* Account */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-semibold text-slate-900 mb-3">Account</h3>
          <p className="text-sm text-slate-600 mb-1">{user.displayName}</p>
          <p className="text-sm text-slate-400 mb-4">{user.email}</p>
          <button onClick={() => { logOut(); router.push("/"); }}
            className="text-sm text-red-500 hover:text-red-700 font-medium">
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}
// already complete
