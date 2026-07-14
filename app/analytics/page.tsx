"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getLevelFromXP, BADGES, ECBA_DOMAINS, generateDailySummary } from "@/lib/domains";
import { getTodaySessions, getSimulationHistory, SimulationSession } from "@/lib/firestore";
import { ArrowLeft, Flame, Zap, Trophy, Download, Share2, Loader2, Target, BookOpen } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [todayData, setTodayData] = useState<{ practices: unknown[]; simulations: unknown[] } | null>(null);
  const [simHistory, setSimHistory] = useState<SimulationSession[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => { if (!loading && !user) router.push("/"); }, [user, loading, router]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const [today, sims] = await Promise.all([
        getTodaySessions(user.uid),
        getSimulationHistory(user.uid, 5),
      ]);
      setTodayData(today as { practices: unknown[]; simulations: unknown[] });
      setSimHistory(sims);
    } catch (e) { console.error(e); }
    finally { setLoadingData(false); }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const link = document.createElement("a");
      link.download = `ecba-summary-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) { console.error(e); }
    finally { setDownloading(false); }
  };

  if (loading || !user || !profile) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const levelInfo = getLevelFromXP(profile.totalXP);
  const earnedBadges = BADGES.filter(b => profile.earnedBadges?.includes(b.id));
  const accuracy = profile.totalQuestions > 0 ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0;
  const todayDate = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Build today sessions summary
  interface PracticeSessionLike {
    domainNumber: number;
    domainName: string;
    score: number;
    totalQuestions: number;
    xpEarned?: number;
    createdAt?: { seconds: number } | null;
  }
  interface SimSessionLike {
    score: number;
    totalQuestions: number;
    xpEarned?: number;
    createdAt?: { seconds: number } | null;
  }
  const todayPractices = (todayData?.practices || []) as PracticeSessionLike[];
  const todaySimulations = (todayData?.simulations || []) as SimSessionLike[];
  const todayXP = [...todayPractices, ...todaySimulations].reduce((a, s) => a + (s.xpEarned || 0), 0);
  const todayCorrect = [...todayPractices, ...todaySimulations].reduce((a, s) => a + s.score, 0);
  const todayTotal = [...todayPractices, ...todaySimulations].reduce((a, s) => a + s.totalQuestions, 0);
  const todayAccuracy = todayTotal > 0 ? Math.round((todayCorrect / todayTotal) * 100) : 0;

  const summarySessions = [
    ...todayPractices.map(s => ({
      domainNumber: s.domainNumber,
      domainName: s.domainName,
      score: s.score,
      total: s.totalQuestions,
    })),
    ...todaySimulations.map(s => ({
      domainNumber: 0,
      domainName: "Full Simulation",
      score: s.score,
      total: s.totalQuestions,
      isSimulation: true,
    })),
  ];

  const autoSummary = generateDailySummary(summarySessions);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-bold text-slate-900 flex-1">Analytics & Daily Summary</h1>
          <button onClick={handleDownload} disabled={downloading}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold px-3 py-1.5 rounded-xl">
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:block">Download</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        ) : (
          <>
            {/* ── INFOGRAFIS CARD (downloadable) ── */}
            <div ref={cardRef} className="bg-white rounded-2xl overflow-hidden border border-slate-200">
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }} className="p-5 text-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-1">ECBA Prep AI — Daily Summary</p>
                    <p className="text-xl font-bold">{profile.displayName}</p>
                    <p className="text-violet-300 text-sm">{todayDate}</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
                    <p className="text-xs text-violet-200">Day</p>
                    <p className="text-xl font-bold">🔥 {profile.currentStreak}</p>
                  </div>
                </div>
                {/* Streak bar */}
                <div className="flex items-center gap-3 bg-white/15 rounded-xl p-3">
                  <div>
                    <p className="text-2xl font-bold">{profile.currentStreak}</p>
                    <p className="text-xs text-violet-200">hari streak</p>
                  </div>
                  <div className="w-px h-8 bg-white/30" />
                  <div>
                    <p className="text-2xl font-bold">{profile.bestStreak}</p>
                    <p className="text-xs text-violet-200">best streak</p>
                  </div>
                  <div className="w-px h-8 bg-white/30" />
                  <div className="flex-1">
                    <p className="text-xs text-violet-200 mb-1">Level {levelInfo.level} — {levelInfo.name}</p>
                    <div className="bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: `${levelInfo.progress}%` }} />
                    </div>
                    <p className="text-xs text-violet-300 mt-0.5">{profile.totalXP.toLocaleString()} XP total</p>
                  </div>
                </div>
              </div>

              {/* Today Stats */}
              <div className="grid grid-cols-3 gap-0 border-b border-slate-100">
                {[
                  { label: "Soal hari ini", value: todayTotal || "—", color: "#7C3AED" },
                  { label: "Akurasi hari ini", value: todayTotal > 0 ? `${todayAccuracy}%` : "—", color: todayAccuracy >= 70 ? "#059669" : "#D97706" },
                  { label: "XP hari ini", value: todayXP > 0 ? `+${todayXP}` : "—", color: "#D97706" },
                ].map((s, i) => (
                  <div key={i} className={`p-4 text-center ${i < 2 ? "border-r border-slate-100" : ""}`}>
                    <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Today Domain Breakdown */}
              {todayPractices.length > 0 && (
                <div className="p-5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Domain dipelajari hari ini</p>
                  <div className="space-y-2.5">
                    {todayPractices.map((s, i) => {
                      const domain = ECBA_DOMAINS.find(d => d.number === s.domainNumber);
                      const pct = Math.round((s.score / s.totalQuestions) * 100);
                      return (
                        <div key={i}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: domain?.bgColor, color: domain?.color }}>D{s.domainNumber}</span>
                            <span className="text-xs text-slate-600 flex-1 truncate">{s.domainName}</span>
                            <span className={`text-xs font-bold ${pct >= 70 ? "text-green-600" : "text-orange-500"}`}>{s.score}/{s.totalQuestions}</span>
                          </div>
                          <div className="ml-8 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "#059669" : "#F59E0B" }} />
                          </div>
                        </div>
                      );
                    })}
                    {todaySimulations.map((s, i) => {
                      const pct = Math.round((s.score / s.totalQuestions) * 100);
                      return (
                        <div key={`sim-${i}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-6 h-6 rounded-md text-xs font-bold flex items-center justify-center flex-shrink-0 bg-indigo-100 text-indigo-700">S</span>
                            <span className="text-xs text-slate-600 flex-1">Full Simulation ({s.totalQuestions} soal)</span>
                            <span className={`text-xs font-bold ${pct >= 70 ? "text-green-600" : "text-orange-500"}`}>{pct}%</span>
                          </div>
                          <div className="ml-8 bg-slate-100 rounded-full h-1.5">
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "#059669" : "#F59E0B" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Auto Summary */}
              <div className="p-5 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">📝 Ringkasan Hari Ini</p>
                <p className="text-sm text-slate-700 leading-relaxed">{todayTotal > 0 ? autoSummary : "Belum ada aktivitas hari ini. Yuk mulai belajar! 💪"}</p>
              </div>

              {/* Badges */}
              {earnedBadges.length > 0 && (
                <div className="p-5 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Badges ({earnedBadges.length}/{BADGES.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {earnedBadges.map(b => (
                      <div key={b.id} className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
                        <span className="text-sm">{b.icon}</span>
                        <span className="text-xs font-medium text-amber-800">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }} className="px-5 py-3 flex justify-between items-center">
                <p className="text-xs text-violet-200">ECBA Prep AI — Free & Open Source</p>
                <p className="text-xs text-violet-200 font-medium">Target: ECBA akhir 2026 💪</p>
              </div>
            </div>

            {/* Download hint */}
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-center gap-3">
              <Share2 className="w-5 h-5 text-violet-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-violet-800">Share ke orang tua</p>
                <p className="text-xs text-violet-600">Klik tombol Download di atas → kirim gambar ke WhatsApp orang tua kamu setiap hari.</p>
              </div>
            </div>

            {/* Overall Stats */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Target className="w-4 h-4" />Overall Progress</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Sessions", value: profile.totalSessions },
                  { label: "Total Questions", value: profile.totalQuestions },
                  { label: "Total Correct", value: profile.totalCorrect },
                  { label: "Overall Accuracy", value: `${accuracy}%` },
                  { label: "Total XP", value: profile.totalXP.toLocaleString() },
                  { label: "Best Streak", value: `${profile.bestStreak} days` },
                ].map(s => (
                  <div key={s.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-lg font-bold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Domain Performance */}
            {profile.domainStats && Object.keys(profile.domainStats).length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4" />Performance by Domain</h3>
                <div className="space-y-3">
                  {ECBA_DOMAINS.map(domain => {
                    const ds = profile.domainStats?.[domain.id];
                    if (!ds) return null;
                    const pct = Math.round((ds.totalCorrect / ds.totalQ) * 100);
                    return (
                      <div key={domain.id}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: domain.bgColor, color: domain.color }}>{domain.number}</span>
                          <span className="text-sm text-slate-700 flex-1 truncate">{domain.name}</span>
                          <span className={`text-sm font-bold ${pct >= 70 ? "text-green-600" : "text-orange-500"}`}>{pct}%</span>
                          <span className="text-xs text-slate-400">{ds.sessions} sesi</span>
                        </div>
                        <div className="ml-8 bg-slate-100 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 70 ? "#059669" : "#F59E0B" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Simulation History */}
            {simHistory.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Trophy className="w-4 h-4" />Recent Simulations</h3>
                <div className="space-y-2">
                  {simHistory.map((s, i) => {
                    const pct = Math.round((s.score / s.totalQuestions) * 100);
                    const ts = s.createdAt as { seconds: number } | null;
                    return (
                      <div key={s.id || i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-slate-900">Simulation #{simHistory.length - i}</p>
                          <p className="text-xs text-slate-400">
                            {ts ? new Date(ts.seconds * 1000).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                            {" · "}{Math.floor(s.timeTaken / 60)}m {s.timeTaken % 60}s
                            {s.xpEarned ? ` · +${s.xpEarned} XP` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${pct >= 70 ? "text-green-600" : "text-orange-500"}`}>{pct}%</p>
                          <p className="text-xs text-slate-400">{s.score}/{s.totalQuestions}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
