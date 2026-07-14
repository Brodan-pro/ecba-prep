"use client";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ECBA_DOMAINS, getLevelFromXP, BADGES } from "@/lib/domains";
import { getApiKey } from "@/lib/gemini";
import ApiKeyModal from "@/components/ApiKeyModal";
import { Brain, Target, LogOut, ChevronRight, BookOpen, Zap, Settings, BarChart2, Flame, Star } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, profile, loading, logOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [showApiModal, setShowApiModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
=======

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ECBA_DOMAINS } from "@/lib/domains";
import { Brain, Target, LogOut, ChevronRight, BookOpen, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

<<<<<<< HEAD
  useEffect(() => {
    if (user) {
      setHasApiKey(!!getApiKey());
      refreshProfile();
    }
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const firstName = user.displayName?.split(" ")[0] || "there";
  const levelInfo = profile ? getLevelFromXP(profile.totalXP) : null;
  const earnedBadges = BADGES.filter(b => profile?.earnedBadges?.includes(b.id));
  const accuracy = profile && profile.totalQuestions > 0
    ? Math.round((profile.totalCorrect / profile.totalQuestions) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {showApiModal && <ApiKeyModal onSuccess={() => { setShowApiModal(false); setHasApiKey(true); }} />}

=======
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user.displayName?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ECBA Prep AI</span>
          </div>
<<<<<<< HEAD
          <div className="flex items-center gap-2">
            <Link href="/analytics" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <BarChart2 className="w-4 h-4" /><span className="hidden sm:block">Analytics</span>
            </Link>
            <Link href="/settings" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <Settings className="w-4 h-4" /><span className="hidden sm:block">Settings</span>
            </Link>
            <button onClick={() => { logOut(); router.push("/"); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <LogOut className="w-4 h-4" /><span className="hidden sm:block">Sign out</span>
=======
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
            <button
              onClick={() => { logOut(); router.push("/"); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
<<<<<<< HEAD
        {/* API Key Warning */}
        {!hasApiKey && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-800 text-sm">🔑 Gemini API Key required</p>
              <p className="text-amber-600 text-xs mt-0.5">Add your free API key to start generating questions.</p>
            </div>
            <button onClick={() => setShowApiModal(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl whitespace-nowrap">
              Add Key
            </button>
          </div>
        )}

        {/* Welcome + Streak */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Hey {firstName}! 👋</h1>
            <p className="text-slate-500 text-sm">Keep your streak alive and master all 9 domains.</p>
          </div>
          {profile && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2.5">
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="text-right">
                <p className="text-xl font-bold text-orange-600">{profile.currentStreak}</p>
                <p className="text-xs text-orange-400">day streak</p>
              </div>
            </div>
          )}
        </div>

        {/* XP Level Card */}
        {levelInfo && profile && (
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-5 text-white mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-violet-200 text-xs font-medium uppercase tracking-wide">Level {levelInfo.level}</p>
                <p className="text-xl font-bold">{levelInfo.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{profile.totalXP.toLocaleString()}</p>
                <p className="text-violet-300 text-xs">Total XP</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-full h-2 mb-1">
              <div className="bg-white h-2 rounded-full transition-all" style={{ width: `${levelInfo.progress}%` }} />
            </div>
            <p className="text-violet-200 text-xs">{levelInfo.currentXP.toLocaleString()} / {levelInfo.nextXP.toLocaleString()} XP to Level {levelInfo.level + 1}</p>
          </div>
        )}

        {/* Stats Row */}
        {profile && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total Sessions", value: profile.totalSessions, color: "text-violet-600" },
              { label: "Questions Done", value: profile.totalQuestions, color: "text-blue-600" },
              { label: "Accuracy", value: `${accuracy}%`, color: accuracy >= 70 ? "text-green-600" : "text-orange-500" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Badges */}
        {earnedBadges.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-slate-900 text-sm">Badges Earned ({earnedBadges.length}/{BADGES.length})</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {earnedBadges.map(b => (
                <div key={b.id} className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                  <span className="text-sm">{b.icon}</span>
                  <span className="text-xs font-medium text-amber-800">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simulation CTA */}
        <Link href="/simulation" className="block mb-6">
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-5 text-white hover:from-violet-700 hover:to-violet-800 transition-all shadow-lg shadow-violet-200 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-xs font-semibold text-violet-200 uppercase tracking-wide">Exam Simulation</span>
                </div>
                <h2 className="text-lg font-bold mb-0.5">Full ECBA Simulation</h2>
                <p className="text-violet-200 text-sm">50 questions · 75 minutes · All 9 domains</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
=======
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Hey {firstName}! 👋
          </h1>
          <p className="text-slate-500">Choose a domain to practice or jump into a full simulation.</p>
        </div>

        {/* Exam Simulation CTA */}
        <Link href="/simulation" className="block mb-8">
          <div className="bg-gradient-to-r from-violet-600 to-violet-700 rounded-2xl p-6 text-white hover:from-violet-700 hover:to-violet-800 transition-all shadow-lg shadow-violet-200 group">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5" />
                  <span className="text-sm font-semibold text-violet-200">EXAM SIMULATION</span>
                </div>
                <h2 className="text-xl font-bold mb-1">Full ECBA Simulation</h2>
                <p className="text-violet-200 text-sm">
                  50 situational questions · 75 minutes · All 9 domains · Timed
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-all">
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

<<<<<<< HEAD
        {/* Domain List */}
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-900">Practice by Domain</h2>
        </div>
        <div className="grid gap-3">
          {ECBA_DOMAINS.map(domain => {
            const ds = profile?.domainStats?.[domain.id];
            const domainAccuracy = ds && ds.totalQ > 0 ? Math.round((ds.totalCorrect / ds.totalQ) * 100) : null;
            return (
              <Link key={domain.id} href={`/practice/${domain.id}`}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all group flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ backgroundColor: domain.bgColor, color: domain.color }}>
                  {domain.number}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">Domain {domain.number}: {domain.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: domain.bgColor, color: domain.color }}>
                      {domain.weight}%
                    </span>
                    {domainAccuracy !== null && (
                      <span className={`text-xs font-medium ${domainAccuracy >= 70 ? "text-green-600" : "text-orange-500"}`}>
                        {domainAccuracy}% accuracy
                      </span>
                    )}
                    {ds && <span className="text-xs text-slate-400">{ds.sessions} sessions</span>}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors flex-shrink-0" />
              </Link>
            );
          })}
=======
        {/* Domain Practice */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Practice by Domain</h2>
          </div>

          <div className="grid gap-3">
            {ECBA_DOMAINS.map((domain) => (
              <Link
                key={domain.id}
                href={`/practice/${domain.id}`}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-violet-300 hover:shadow-sm transition-all group flex items-center gap-4"
              >
                {/* Domain Number Badge */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ backgroundColor: domain.bgColor, color: domain.color }}
                >
                  {domain.number}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 text-sm truncate">
                      Domain {domain.number}: {domain.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: domain.bgColor, color: domain.color }}
                    >
                      {domain.weight}% of exam
                    </span>
                    <span className="text-xs text-slate-400">~{domain.questionCount} questions</span>
                    <span className="text-xs text-slate-400">{domain.activities.length} activities</span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
        </div>
      </main>
    </div>
  );
}
