"use client";
import { useEffect, useState, use } from "react";
import { getUserProfile, UserProfile } from "@/lib/firestore";
import { getLevelFromXP, BADGES, ECBA_DOMAINS } from "@/lib/domains";
import { Flame, Trophy, BookOpen, Target, Loader2, AlertCircle } from "lucide-react";

export default function SharedPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getUserProfile(userId);
        if (!p) setError("Profile not found.");
        else setProfile(p);
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Loading progress...</p>
      </div>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">{error || "Profile not found."}</p>
      </div>
    </div>
  );

  const levelInfo = getLevelFromXP(profile.totalXP);
  const earnedBadges = BADGES.filter(b => profile.earnedBadges?.includes(b.id));
  const accuracy = profile.totalQuestions > 0
    ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0;

  const lastActive = profile.lastActiveDate
    ? new Date(profile.lastActiveDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "Belum ada aktivitas";

  const isActiveToday = profile.lastActiveDate === new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }} className="px-4 py-8 text-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest mb-2">ECBA Prep AI — Progress Monitor</p>
          <h1 className="text-2xl font-bold mb-1">{profile.displayName}</h1>
          <p className="text-violet-300 text-sm">{profile.email}</p>
          <div className={`inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${isActiveToday ? "bg-green-400/30 text-green-200" : "bg-white/20 text-violet-200"}`}>
            <span className={`w-2 h-2 rounded-full ${isActiveToday ? "bg-green-400" : "bg-slate-400"}`} />
            {isActiveToday ? "✅ Belajar hari ini" : "❌ Belum belajar hari ini"}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Streak + Level */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-3xl font-bold text-orange-500">{profile.currentStreak}</span>
            </div>
            <p className="text-xs text-slate-500">Hari streak beruntun</p>
            <p className="text-xs text-slate-400 mt-0.5">Best: {profile.bestStreak} hari</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-violet-600">{levelInfo.level}</p>
            <p className="text-xs font-medium text-violet-700">{levelInfo.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{profile.totalXP.toLocaleString()} XP</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-slate-700">Level {levelInfo.level} → {levelInfo.level + 1}</p>
            <p className="text-xs text-slate-500">{levelInfo.currentXP} / {levelInfo.nextXP} XP</p>
          </div>
          <div className="bg-slate-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-violet-600 transition-all"
              style={{ width: `${levelInfo.progress}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />Statistik Belajar
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Total Sesi", value: profile.totalSessions },
              { label: "Total Soal", value: profile.totalQuestions },
              { label: "Jawaban Benar", value: profile.totalCorrect },
              { label: "Akurasi", value: `${accuracy}%`, highlight: accuracy >= 70 },
            ].map(s => (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                <p className={`text-xl font-bold ${s.highlight !== undefined ? s.highlight ? "text-green-600" : "text-orange-500" : "text-slate-900"}`}>
                  {s.value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">Terakhir aktif: <span className="font-medium text-slate-700">{lastActive}</span></p>
          </div>
        </div>

        {/* Domain Progress */}
        {profile.domainStats && Object.keys(profile.domainStats).length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-500" />Progress per Domain
            </h3>
            <div className="space-y-3">
              {ECBA_DOMAINS.map(domain => {
                const ds = profile.domainStats?.[domain.id];
                if (!ds) return (
                  <div key={domain.id} className="flex items-center gap-2 opacity-40">
                    <span className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: domain.bgColor, color: domain.color }}>{domain.number}</span>
                    <span className="text-sm text-slate-500 flex-1 truncate">{domain.name}</span>
                    <span className="text-xs text-slate-400">Belum dipelajari</span>
                  </div>
                );
                const pct = Math.round((ds.totalCorrect / ds.totalQ) * 100);
                return (
                  <div key={domain.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: domain.bgColor, color: domain.color }}>{domain.number}</span>
                      <span className="text-sm text-slate-700 flex-1 truncate">{domain.name}</span>
                      <span className={`text-sm font-bold ${pct >= 70 ? "text-green-600" : "text-orange-500"}`}>{pct}%</span>
                      <span className="text-xs text-slate-400">{ds.sessions}x</span>
                    </div>
                    <div className="ml-8 bg-slate-100 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "#059669" : "#F59E0B" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />Badges ({earnedBadges.length}/{BADGES.length})
          </h3>
          {earnedBadges.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-2">Belum ada badge. Terus semangat! 💪</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(b => (
                <div key={b.id} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                  <span className="text-sm">{b.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-amber-800">{b.name}</p>
                    <p className="text-xs text-amber-600">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">Dipantau via ECBA Prep AI</p>
          <p className="text-xs text-slate-400">🎯 Target: ECBA sebelum akhir 2026</p>
          <p className="text-xs text-slate-300 mt-1">Halaman ini hanya bisa diakses dengan link khusus</p>
        </div>
      </main>
    </div>
  );
}
