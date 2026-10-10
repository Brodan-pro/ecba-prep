"use client";
import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ECBA_DOMAINS } from "@/lib/domains";
import { generateQuestionsForDomain, Question, getApiKey } from "@/lib/gemini";
import { savePracticeSession, getPracticeHistory, PracticeSession } from "@/lib/firestore";
import ApiKeyModal from "@/components/ApiKeyModal";
import {
  ArrowLeft, Loader2, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  History, BookOpen, Globe, Zap, Trophy,
} from "lucide-react";
import Link from "next/link";

/** Menangani Date, Firestore Timestamp (toDate), maupun { seconds } */
function formatSessionDate(value: unknown, locale: string): string {
  if (!value) return "—";
  let date: Date | null = null;
  if (value instanceof Date) {
    date = value;
  } else if (typeof (value as { toDate?: unknown }).toDate === "function") {
    date = (value as { toDate: () => Date }).toDate();
  } else if (typeof (value as { seconds?: unknown }).seconds === "number") {
    date = new Date((value as { seconds: number }).seconds * 1000);
  }
  return date
    ? date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
    : "—";
}

type Lang = "en" | "id";
const LANG_KEY = "ecba_lang"; // kunci yang sama dengan halaman Analytics
const LOCALE: Record<Lang, string> = { en: "en-US", id: "id-ID" };

const MSG: Record<Lang, { userLimit: string; globalLimit: string }> = {
  en: {
    userLimit: "Your daily demo limit is used up. Try again tomorrow (resets 07:00 WIB), or sign up and add your own API key in Settings (no limit).",
    globalLimit: "Today's demo quota is used up for all visitors. Try again tomorrow, or add your own API key in Settings.",
  },
  id: {
    userLimit: "Batas demo harianmu habis. Coba lagi besok (reset jam 07.00 WIB), atau daftar dan pakai API key sendiri di Settings (tanpa batas).",
    globalLimit: "Kuota demo hari ini habis untuk semua pengunjung. Coba lagi besok, atau pakai API key sendiri di Settings.",
  },
};

export default function PracticePage({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = use(params);
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const domain = ECBA_DOMAINS.find((d) => d.id === domainId);

  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    try {
      return window.localStorage.getItem(LANG_KEY) === "id" ? "id" : "en";
    } catch {
      return "en";
    }
  });
  const changeLang = (next: Lang) => {
    setLang(next);
    setExpLang({}); // penjelasan ikut bahasa baru
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      /* abaikan */
    }
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [expLang, setExpLang] = useState<Record<string, "en" | "id">>({});
  const [saving, setSaving] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [xpResult, setXpResult] = useState<{ xpEarned: number; newBadges: string[]; newStreak: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const loadHistory = useCallback(async () => {
    if (!user || !domain) return;
    try {
      setHistory(await getPracticeHistory(user.uid, domain.id));
    } catch (e) {
      console.error(e);
    }
  }, [user, domain]);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  // Load riwayat saat halaman dibuka (setState hanya dipanggil setelah data datang)
  useEffect(() => {
    if (!user || !domain) return;
    let cancelled = false;
    getPracticeHistory(user.uid, domain.id)
      .then((h) => { if (!cancelled) setHistory(h); })
      .catch((e) => console.error(e));
    return () => { cancelled = true; };
  }, [user, domain]);

  const handleGenerate = async () => {
    // Guest (anonymous) memakai mode demo lewat server, user lain wajib punya API key sendiri
    if (!getApiKey() && !user?.isAnonymous) {
      setShowApiModal(true);
      return;
    }
    if (!domain) return;
    setGenerating(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setExpandedExp(null);
    setXpResult(null);
    setStartTime(Date.now());
    try {
      setQuestions(await generateQuestionsForDomain(domain, 5));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "NO_API_KEY") setShowApiModal(true);
      else if (msg === "DEMO_USER_LIMIT")
        setError(MSG[lang].userLimit);
      else if (msg === "DEMO_GLOBAL_LIMIT")
        setError(MSG[lang].globalLimit);
      else if (msg.includes("All models failed"))
        setError("Gemini is overloaded. Auto-retried — please wait and try again.");
      else setError("Failed to generate. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!user || !domain) return;
    setSubmitted(true);
    const finalScore = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    setSaving(true);
    try {
      const result = await savePracticeSession({
        userId: user.uid,
        domainId: domain.id,
        domainNumber: domain.number,
        domainName: domain.name,
        questions,
        answers,
        score: finalScore,
        totalQuestions: questions.length,
        timeTakenSeconds: timeTaken,
      });
      setXpResult(result);
      await refreshProfile();
      await loadHistory();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const score = submitted
    ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0)
    : 0;

  if (!domain)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Domain not found.</p>
      </div>
    );
  if (loading || !user) return null;

  const passed = questions.length > 0 && score / questions.length >= 0.7;

  return (
    <div className="min-h-screen bg-slate-50">
      {showApiModal && (
        <ApiKeyModal
          onSuccess={() => {
            setShowApiModal(false);
            handleGenerate();
          }}
        />
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: domain.bgColor, color: domain.color }}
            >
              {domain.number}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">
                Domain {domain.number}: {domain.name}
              </h1>
              <p className="text-xs text-slate-400">{domain.weight}% of ECBA exam</p>
            </div>
          </div>
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5" role="group" aria-label="Language">
            {(["en", "id"] as const).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                aria-pressed={lang === l}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  lang === l ? "bg-white text-violet-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:block">History ({history.length})</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* History Panel */}
        {showHistory && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="w-4 h-4" />
              Past Sessions
            </h2>
            {history.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No sessions yet.</p>
            ) : (
              <div className="space-y-2">
                {history.map((s, i) => (
                  <div
                    key={s.id || i}
                    className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">Session {history.length - i}</p>
                      <p className="text-xs text-slate-400">
                        {formatSessionDate(s.createdAt, LOCALE[lang])}
                        {s.xpEarned ? ` · +${s.xpEarned} XP` : ""}
                      </p>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        s.score / s.totalQuestions >= 0.7 ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {s.score}/{s.totalQuestions} ({Math.round((s.score / s.totalQuestions) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Generate Button */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-slate-900 mb-1">Generate Practice Questions</h2>
              <p className="text-sm text-slate-500">
                5 situational MCQs covering all {domain.activities.length} activity statements.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {generating && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Generating questions...</p>
            <p className="text-slate-400 text-sm mt-1">
              AI is crafting situational scenarios for Domain {domain.number}
            </p>
          </div>
        )}

        {questions.length > 0 && !generating && (
          <>
            {submitted && (
              <div
                className={`rounded-2xl p-5 mb-6 ${
                  passed ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                      passed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {score}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${passed ? "text-green-800" : "text-orange-800"}`}>
                      {score}/{questions.length} correct — {Math.round((score / questions.length) * 100)}%
                    </p>
                    <p className={`text-sm ${passed ? "text-green-600" : "text-orange-600"}`}>
                      {score / questions.length >= 0.8
                        ? "Excellent! 🎉"
                        : passed
                        ? "Good work! 👍"
                        : "Keep practicing! Review explanations below."}
                    </p>
                  </div>
                  {xpResult && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-violet-600 font-bold">
                        <Zap className="w-4 h-4" />+{xpResult.xpEarned} XP
                      </div>
                      {xpResult.newBadges.length > 0 && (
                        <p className="text-xs text-amber-600 mt-0.5">🏆 {xpResult.newBadges.length} new badge!</p>
                      )}
                    </div>
                  )}
                  {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
              </div>
            )}

            <div className="space-y-5">
              {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct;
                const explLang = expLang[q.id] || lang;
                return (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-5 pb-4">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2"
                            style={{ backgroundColor: domain.bgColor, color: domain.color }}
                          >
                            Activity {q.activity}
                          </span>
                          <p className="text-slate-800 text-sm leading-relaxed">{q.question}</p>
                        </div>
                      </div>
                      <div className="space-y-2 ml-10">
                        {(["A", "B", "C", "D"] as const).map((choice) => {
                          const isSelected = userAnswer === choice;
                          const isCorrectChoice = q.correct === choice;
                          let cls =
                            "border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 cursor-pointer";
                          if (submitted) {
                            if (isCorrectChoice) cls = "border-green-400 bg-green-50 text-green-800 cursor-default";
                            else if (isSelected && !isCorrect)
                              cls = "border-red-400 bg-red-50 text-red-800 cursor-default";
                            else cls = "border-slate-200 text-slate-400 cursor-default opacity-50";
                          } else if (isSelected) {
                            cls = "border-violet-500 bg-violet-50 text-violet-800 cursor-pointer";
                          }
                          return (
                            <button
                              key={choice}
                              onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [q.id]: choice }))}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center gap-3 transition-all ${cls}`}
                            >
                              <span
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected && !submitted ? "border-violet-500 bg-violet-500 text-white" : ""
                                }`}
                              >
                                {choice}
                              </span>
                              <span>{q.choices[choice]}</span>
                              {submitted && isCorrectChoice && (
                                <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto shrink-0" />
                              )}
                              {submitted && isSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {submitted && (
                      <div className="border-t border-slate-100">
                        <button
                          onClick={() => setExpandedExp(expandedExp === q.id ? null : q.id)}
                          className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            View Explanation
                          </span>
                          {expandedExp === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedExp === q.id && (
                          <div className="px-5 pb-5">
                            <button
                              onClick={() =>
                                setExpLang((prev) => ({ ...prev, [q.id]: (prev[q.id] || lang) === "en" ? "id" : "en" }))
                              }
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 mb-3"
                            >
                              <Globe className="w-3.5 h-3.5" />
                              {explLang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
                            </button>
                            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                              {explLang === "id" ? q.explanation_id : q.explanation_en}
                            </div>
                            <p className="text-xs text-slate-400 mt-2">📚 {q.babok_reference}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!submitted && (
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl"
                >
                  {Object.keys(answers).length < questions.length
                    ? `Answer all questions (${Object.keys(answers).length}/${questions.length})`
                    : "Submit & See Results"}
                </button>
              </div>
            )}

            {submitted && (
              <div className="mt-6 space-y-3">
                <Link
                  href="/analytics"
                  className="w-full bg-violet-50 border border-violet-200 text-violet-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  View Analytics Dashboard
                </Link>
                <button
                  onClick={handleGenerate}
                  className="w-full bg-white border-2 border-violet-300 hover:border-violet-500 text-violet-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New Questions
                </button>
              </div>
            )}
          </>
        )}

        {questions.length === 0 && !generating && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              style={{ backgroundColor: domain.bgColor, color: domain.color }}
            >
              {domain.number}
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Ready to practice?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Click &quot;Generate&quot; to get 5 AI-crafted situational questions for this domain.
            </p>
            <div className="text-left bg-slate-50 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Covers Activities</p>
              {domain.activities.map((a) => (
                <p key={a.id} className="text-xs text-slate-600 mb-1">
                  <span className="font-medium text-slate-800">{a.id}</span> — {a.text.slice(0, 70)}...
                </p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}