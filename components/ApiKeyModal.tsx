"use client";
import { useState } from "react";
import { saveApiKey, validateApiKey } from "@/lib/gemini";
import { Key, ExternalLink, Loader2, CheckCircle2, X } from "lucide-react";

interface ApiKeyModalProps {
  onSuccess: () => void;
}

export default function ApiKeyModal({ onSuccess }: ApiKeyModalProps) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!key.trim()) { setError("Please enter your API key."); return; }
    setLoading(true);
    setError("");
    try {
      const valid = await validateApiKey(key.trim());
      if (!valid) { setError("Invalid API key. Please check and try again."); return; }
      saveApiKey(key.trim());
      onSuccess();
    } catch {
      setError("Could not validate key. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Enter Your Gemini API Key</h2>
            <p className="text-xs text-slate-500">Required to generate questions</p>
          </div>
        </div>

        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-5">
          <p className="text-sm text-violet-800 mb-1 font-medium">🔐 Your key stays on your device</p>
          <p className="text-xs text-violet-600">Your API key is stored only in your browser's local storage and is never sent to our servers. Each user uses their own free quota.</p>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-slate-700">Gemini API Key</label>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
              className="text-xs text-violet-600 flex items-center gap-1 hover:underline">
              Get free key <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setError(""); }}
            placeholder="AIzaSy..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm font-mono"
          />
          {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}
        </div>

        <div className="text-xs text-slate-400 mb-4 space-y-1">
          <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />Free tier: 1,000 requests/day (resets daily)</p>
          <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />Auto-retry if model is overloaded</p>
          <p className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" />Works across all features</p>
        </div>

        <button onClick={handleSave} disabled={loading || !key.trim()}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Validating...</> : "Save & Continue →"}
        </button>
      </div>
    </div>
  );
}
