"use client";
<<<<<<< HEAD
=======

>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ECBA_DOMAINS } from "@/lib/domains";
<<<<<<< HEAD
import { generateQuestionsForDomain, Question, getApiKey } from "@/lib/gemini";
import { savePracticeSession, getPracticeHistory, PracticeSession } from "@/lib/firestore";
import ApiKeyModal from "@/components/ApiKeyModal";
import { ArrowLeft, Loader2, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronUp, History, BookOpen, Globe, Zap, Trophy } from "lucide-react";
=======
import { generateQuestionsForDomain, Question } from "@/lib/gemini";
import { savePracticeSession, getPracticeHistory, PracticeSession } from "@/lib/firestore";
import {
  ArrowLeft, Loader2, RefreshCw, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, History, BookOpen, Globe
} from "lucide-react";
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
import Link from "next/link";

export default function PracticePage({ params }: { params: Promise<{ domainId: string }> }) {
  const { domainId } = use(params);
<<<<<<< HEAD
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const domain = ECBA_DOMAINS.find(d => d.id === domainId);
=======
  const { user, loading } = useAuth();
  const router = useRouter();

  const domain = ECBA_DOMAINS.find((d) => d.id === domainId);
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PracticeSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
<<<<<<< HEAD
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [expLang, setExpLang] = useState<Record<string, "en"|"id">>({});
  const [saving, setSaving] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [xpResult, setXpResult] = useState<{ xpEarned: number; newBadges: string[]; newStreak: number } | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => { if (!loading && !user) router.push("/"); }, [user, loading, router]);
  useEffect(() => { if (user && domain) loadHistory(); }, [user, domain]);

  const loadHistory = async () => {
    if (!user || !domain) return;
    try { setHistory(await getPracticeHistory(user.uid, domain.id)); } catch (e) { console.error(e); }
  };

  const handleGenerate = async () => {
    if (!getApiKey()) { setShowApiModal(true); return; }
    if (!domain) return;
    setGenerating(true); setError(""); setQuestions([]); setAnswers({}); setSubmitted(false); setExpandedExp(null); setXpResult(null);
    setStartTime(Date.now());
    try {
      setQuestions(await generateQuestionsForDomain(domain, 5));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "NO_API_KEY") { setShowApiModal(true); }
      else if (msg.includes("All models failed")) setError("Gemini is overloaded. Auto-retried — please wait and try again.");
      else setError("Failed to generate. Please try again.");
    } finally { setGenerating(false); }
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  };

  const handleSubmit = async () => {
    if (!user || !domain) return;
    setSubmitted(true);
<<<<<<< HEAD
    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
    const timeTaken = Math.round((Date.now() - startTime) / 1000);
    setSaving(true);
    try {
      const result = await savePracticeSession({
        userId: user.uid, domainId: domain.id, domainNumber: domain.number,
        domainName: domain.name, questions, answers, score,
        totalQuestions: questions.length, timeTakenSeconds: timeTaken,
      });
      setXpResult(result);
      await refreshProfile();
      await loadHistory();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const score = submitted ? questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0) : 0;

  if (!domain) return <div className="min-h-screen flex items-center justify-center"><p className="text-slate-500">Domain not found.</p></div>;
=======

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

>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
<<<<<<< HEAD
      {showApiModal && <ApiKeyModal onSuccess={() => { setShowApiModal(false); handleGenerate(); }} />}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="w-5 h-5" /></Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: domain.bgColor, color: domain.color }}>{domain.number}</div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">Domain {domain.number}: {domain.name}</h1>
              <p className="text-xs text-slate-400">{domain.weight}% of ECBA exam</p>
            </div>
          </div>
          <button onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100">
            <History className="w-4 h-4" /><span className="hidden sm:block">History ({history.length})</span>
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* History Panel */}
        {showHistory && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
<<<<<<< HEAD
            <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><History className="w-4 h-4" />Past Sessions</h2>
            {history.length === 0 ? <p className="text-slate-400 text-sm text-center py-4">No sessions yet.</p> : (
              <div className="space-y-2">
                {history.map((s, i) => (
                  <div key={s.id||i} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Session {history.length - i}</p>
                      <p className="text-xs text-slate-400">
                        {s.createdAt ? new Date((s.createdAt as {seconds:number}).seconds*1000).toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                        {s.xpEarned ? ` · +${s.xpEarned} XP` : ""}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${s.score/s.totalQuestions>=0.7?"text-green-600":"text-red-500"}`}>
                      {s.score}/{s.totalQuestions} ({Math.round((s.score/s.totalQuestions)*100)}%)
                    </span>
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
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
<<<<<<< HEAD
              <p className="text-sm text-slate-500">5 situational MCQs covering all {domain.activities.length} activity statements.</p>
            </div>
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap">
              {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><RefreshCw className="w-4 h-4" />Generate</>}
            </button>
          </div>
          {error && <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>}
        </div>

        {generating && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Generating questions...</p>
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
            <p className="text-slate-400 text-sm mt-1">AI is crafting situational scenarios for Domain {domain.number}</p>
          </div>
        )}

<<<<<<< HEAD
        {questions.length > 0 && !generating && (
          <>
            {submitted && (
              <div className={`rounded-2xl p-5 mb-6 ${score/questions.length>=0.7?"bg-green-50 border border-green-200":"bg-orange-50 border border-orange-200"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${score/questions.length>=0.7?"bg-green-100 text-green-700":"bg-orange-100 text-orange-700"}`}>
                    {score}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${score/questions.length>=0.7?"text-green-800":"text-orange-800"}`}>
                      {score}/{questions.length} correct — {Math.round((score/questions.length)*100)}%
                    </p>
                    <p className={`text-sm ${score/questions.length>=0.7?"text-green-600":"text-orange-600"}`}>
                      {score/questions.length>=0.8?"Excellent! 🎉":score/questions.length>=0.7?"Good work! 👍":"Keep practicing! Review explanations below."}
                    </p>
                  </div>
                  {xpResult && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-violet-600 font-bold"><Zap className="w-4 h-4" />+{xpResult.xpEarned} XP</div>
                      {xpResult.newBadges.length > 0 && <p className="text-xs text-amber-600 mt-0.5">🏆 {xpResult.newBadges.length} new badge!</p>}
                    </div>
                  )}
                  {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                </div>
              </div>
            )}

<<<<<<< HEAD
=======
            {/* Question Cards */}
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
            <div className="space-y-5">
              {questions.map((q, index) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correct;
<<<<<<< HEAD
                const lang = expLang[q.id] || "id";
                return (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="p-5 pb-4">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 mt-0.5">{index+1}</span>
                        <div className="flex-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full inline-block mb-2"
                            style={{ backgroundColor: domain.bgColor, color: domain.color }}>Activity {q.activity}</span>
                          <p className="text-slate-800 text-sm leading-relaxed">{q.question}</p>
                        </div>
                      </div>
                      <div className="space-y-2 ml-10">
                        {(["A","B","C","D"] as const).map(choice => {
                          const isSelected = userAnswer === choice;
                          const isCorrectChoice = q.correct === choice;
                          let cls = "border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700 cursor-pointer";
                          if (submitted) {
                            if (isCorrectChoice) cls = "border-green-400 bg-green-50 text-green-800 cursor-default";
                            else if (isSelected && !isCorrect) cls = "border-red-400 bg-red-50 text-red-800 cursor-default";
                            else cls = "border-slate-200 text-slate-400 cursor-default opacity-50";
                          } else if (isSelected) cls = "border-violet-500 bg-violet-50 text-violet-800 cursor-pointer";
                          return (
                            <button key={choice} onClick={() => !submitted && setAnswers(prev=>({...prev,[q.id]:choice}))}
                              className={`w-full text-left px-4 py-3 rounded-xl border text-sm flex items-center gap-3 transition-all ${cls}`}>
                              <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected&&!submitted?"border-violet-500 bg-violet-500 text-white":""}`}>{choice}</span>
                              <span>{q.choices[choice]}</span>
                              {submitted && isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto flex-shrink-0" />}
                              {submitted && isSelected && !isCorrect && choice===userAnswer && <XCircle className="w-4 h-4 text-red-500 ml-auto flex-shrink-0" />}
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                            </button>
                          );
                        })}
                      </div>
                    </div>
<<<<<<< HEAD
                    {submitted && (
                      <div className="border-t border-slate-100">
                        <button onClick={() => setExpandedExp(expandedExp===q.id?null:q.id)}
                          className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-slate-600 hover:bg-slate-50">
                          <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" />View Explanation</span>
                          {expandedExp===q.id?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}
                        </button>
                        {expandedExp===q.id && (
                          <div className="px-5 pb-5">
                            <button onClick={() => setExpLang(prev=>({...prev,[q.id]:prev[q.id]==="en"?"id":"en"}))}
                              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 mb-3">
                              <Globe className="w-3.5 h-3.5" />{lang==="id"?"Switch to English":"Ganti ke Bahasa Indonesia"}
                            </button>
                            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                              {lang==="id"?q.explanation_id:q.explanation_en}
=======

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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
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

<<<<<<< HEAD
            {!submitted && (
              <div className="mt-6">
                <button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3.5 rounded-xl">
                  {Object.keys(answers).length < questions.length ? `Answer all questions (${Object.keys(answers).length}/${questions.length})` : "Submit & See Results"}
                </button>
              </div>
            )}
            {submitted && (
              <div className="mt-6 space-y-3">
                <Link href="/analytics" className="block w-full bg-violet-50 border border-violet-200 text-violet-700 font-semibold py-3 rounded-xl text-center flex items-center justify-center gap-2">
                  <Trophy className="w-4 h-4" />View Analytics Dashboard
                </Link>
                <button onClick={handleGenerate}
                  className="w-full bg-white border-2 border-violet-300 hover:border-violet-500 text-violet-600 font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />Generate New Questions
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                </button>
              </div>
            )}
          </>
        )}

<<<<<<< HEAD
        {questions.length === 0 && !generating && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4"
              style={{ backgroundColor: domain.bgColor, color: domain.color }}>{domain.number}</div>
            <h3 className="font-bold text-slate-900 mb-2">Ready to practice?</h3>
            <p className="text-slate-400 text-sm mb-6">Click "Generate" to get 5 AI-crafted situational questions for this domain.</p>
            <div className="text-left bg-slate-50 rounded-xl p-4 max-w-sm mx-auto">
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Covers Activities</p>
              {domain.activities.map(a => (
                <p key={a.id} className="text-xs text-slate-600 mb-1">
                  <span className="font-medium text-slate-800">{a.id}</span> — {a.text.slice(0,70)}...
=======
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
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                </p>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
