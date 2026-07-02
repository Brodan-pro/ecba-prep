"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ECBA_DOMAINS } from "@/lib/domains";
import { Brain, Target, LogOut, ChevronRight, BookOpen, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ECBA Prep AI</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">{user.email}</span>
            <button
              onClick={() => { logOut(); router.push("/"); }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
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
                <Zap className="w-6 h-6" />
              </div>
            </div>
          </div>
        </Link>

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
        </div>
      </main>
    </div>
  );
}
