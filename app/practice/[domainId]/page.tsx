"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ECBA_DOMAINS } from "@/lib/domains";
import { generateQuestionsForDomain, Question } from "@/lib/gemini";
import { savePracticeSession, getPracticeHistory, PracticeSession } from "@/lib/firestore";
import {
  ArrowLeft, Loader2, RefreshCw, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, History, BookOpen, Globe
} from "lucide-react";
import Link from "next/link";

export default function PracticePage({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  const domain = ECBA_DOMAINS.find((d) => d.id === domainId);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [explanationLang, setExplanationLang] = useState<Record<string, "en" | "id">>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && domain) {
      loadHistory();
    }
  }, [user, domain]);

  const loadHistory = async () => {
    if (!user || !domain) return;
    try {
      const h = await getPracticeHistory(user.uid, domain.id);
      setHistory(h);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerate = async () => {
    if (!domain) return;
    setGenerating(true);
    setError("");
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setExpandedExplanation(null);
    try {
      const qs = await generateQuestionsForDomain(domain, 5);
      setQuestions(qs);
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "";
      if (errMsg.includes("All models failed")) {
        setError("Gemini is currently overloaded. Already retried automatically — please wait a moment and try again.");
      } else if (errMsg.includes("API key") || errMsg.includes("invalid")) {
        setError("Invalid API key. Please check your .env.local file.");
      } else {
        setError("Failed to generate questions. Please try again.");
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId: string, choice: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: choice }));
  };

  const handleSubmit = async () => {
    if (!user || !domain) return;
    setSubmitted(true);

    const score = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correct ? 1 : 0);
    }, 0);

    setSaving(true);
    try {
      await savePracticeSession({
        userId: user.uid,
        domainId: domain.id,
        domainName: domain.name,
        questions,
        answers,
        score,
        totalQuestions: questions.length,
      });
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

  const toggleExplanation = (id: string) => {
    setExpandedExplanation(expandedExplanation === id ? null : id);
    if (!explanationLang[id]) {
      setExplanationLang((prev) => ({ ...prev, [id]: "id" }));
    }
  };

  const toggleLang = (id: string) => {
    setExplanationLang((prev) => ({ ...prev, [id]: prev[id] === "en" ? "id" : "en" }));
  };

  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Domain not found.</p>
      </div>
    );
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-900 transition-colors">
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
              <h1 className="font-bold text-slate-900 text-sm leading-tight">
                Domain {domain.number}: {domain.name}
              </h1>
              <p className="text-xs text-slate-400">{domain.weight}% of ECBA exam</p>
            </div>
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
              <History className="w-4 h-4" /> Past Sessions
            </h2>
            {history.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">No sessions yet. Generate your first questions!</p>
            ) : (
              <div className="space-y-2">
                {history.map((s, i) => (
                  <div key={s.id || i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Session {history.length - i}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.createdAt ? new Date((s.createdAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        }) : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${s.score / s.totalQuestions >= 0.7 ? "text-green-600" : "text-red-500"}`}>
                        {s.score}/{s.totalQuestions}
                      </span>
                      <p className="text-xs text-slate-400">
                        {Math.round((s.score / s.totalQuestions) * 100)}%
                      </p>
                    </div>
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
                5 situational MCQs covering all {domain.activities.length} activity statements in this domain.
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap"
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              ) : (
                <><RefreshCw className="w-4 h-4" /> Generate</>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Loading State */}
        {generating && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Generating your questions...</p>
            <p className="text-slate-400 text-sm mt-1">AI is crafting situational scenarios for Domain {domain.number}</p>
          </div>
        )}

        {/* Questions */}
        {questions.length > 0 && !generating && (
          <>
            {/* Score Banner (after submit) */}
            {submitted && (
              <div className={`rounded-2xl p-5 mb-6 ${score / questions.length >= 0.7 ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${score / questions.length >= 0.7 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {score}
                  </div>
                  <div>
                    <p className={`font-bold ${score / questions.length >= 0.7 ? "text-green-800" : "text-orange-800"}`}>
                      {score}/{questions.length} correct — {Math.round((score / questions.length) * 100)}%
                    </p>
                    <p className={`text-sm ${score / questions.length >= 0.7 ? "text-green-600" : "text-orange-600"}`}>
                      {score / questions.length >= 0.8 ? "Excellent! You nailed it 🎉" : score / questions.length >= 0.7 ? "Good work! Keep it up 👍" : "Keep practicing! Review the explanations below."}
                    </p>
                  </div>
                  {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400 ml-auto" />}
                </div>
              </div>
            )}

            {/* Question Cards */}
            <div className="space-y-5">
              {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct;
                const showResult = submitted && userAnswer;
                const lang = explanationLang[q.id] || "id";

                return (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    {/* Question Header */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: domain.bgColor, color: domain.color }}>
                              Activity {q.activity}
                            </span>
                          </div>
                          <p className="text-slate-800 text-sm leading-relaxed">{q.question}</p>
                        </div>
                      </div>

                      {/* Choices */}
                      <div className="space-y-2 ml-10">
                        {(["A", "B", "C", "D"] as const).map((choice) => {
                          const isSelected = userAnswer === choice;
                          const isCorrectChoice = q.correct === choice;

                          let style = "border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 cursor-pointer";
                          if (submitted) {
                            if (isCorrectChoice) style = "border-green-400 bg-green-50 text-green-800 cursor-default";
                            else if (isSelected && !isCorrect) style = "border-red-400 bg-red-50 text-red-800 cursor-default";
                            else style = "border-slate-200 text-slate-500 cursor-default opacity-60";
                          } else if (isSelected) {
                            style = "border-violet-500 bg-violet-50 text-violet-800 cursor-pointer";
                          }

                          return (
                            <button
                              key={choice}
                              onClick={() => handleAnswer(q.id, choice)}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center gap-3 transition-all ${style}`}
                            >
                              <span className="w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={isSelected && !submitted ? { borderColor: "#7C3AED", backgroundColor: "#7C3AED", color: "white" } : {}}>
                                {choice}
                              </span>
                              <span>{q.choices[choice]}</span>
                              {submitted && isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />}
                              {submitted && isSelected && !isCorrect && choice === userAnswer && <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation Toggle */}
                    {submitted && (
                      <div className="border-t border-slate-100">
                        <button
                          onClick={() => toggleExplanation(q.id)}
                          className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        >
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            View Explanation
                          </span>
                          {expandedExplanation === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {expandedExplanation === q.id && (
                          <div className="px-5 pb-5">
                            <div className="flex items-center gap-2 mb-3">
                              <button
                                onClick={() => toggleLang(q.id)}
                                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                {lang === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"}
                              </button>
                              <span className="text-xs text-slate-400">
                                {lang === "id" ? "🇮🇩 Bahasa Indonesia" : "🇬🇧 English"}
                              </span>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                              {lang === "id" ? q.explanation_id : q.explanation_en}
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

            {/* Submit Button */}
            {!submitted && (
              <div className="mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questions.length}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl transition-all"
                >
                  {Object.keys(answers).length < questions.length
                    ? `Answer all questions (${Object.keys(answers).length}/${questions.length})`
                    : "Submit & See Results"}
                </button>
              </div>
            )}

            {/* Generate Again */}
            {submitted && (
              <div className="mt-6">
                <button
                  onClick={handleGenerate}
                  className="w-full bg-white border-2 border-violet-300 hover:border-violet-500 text-violet-600 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New Questions
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {questions.length === 0 && !generating && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              style={{ backgroundColor: domain.bgColor, color: domain.color }}>
              {domain.number}
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Ready to practice?</h3>
            <p className="text-slate-400 text-sm mb-6">
              Click "Generate" to get 5 AI-crafted situational questions for this domain.
            </p>
            <div className="text-left bg-slate-50 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Covers Activities</p>
              {domain.activities.map((a) => (
                <p key={a.id} className="text-xs text-slate-600 mb-1">
                  <span className="font-medium text-slate-800">{a.id}</span> — {a.text.slice(0, 60)}...
                </p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
