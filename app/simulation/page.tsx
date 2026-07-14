"use client";
<<<<<<< HEAD
=======

>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ECBA_DOMAINS, EXAM_DURATION_SECONDS } from "@/lib/domains";
<<<<<<< HEAD
import { generateQuestionsForDomain, Question, getApiKey } from "@/lib/gemini";
import { saveSimulationSession, getSimulationHistory, SimulationSession } from "@/lib/firestore";
import ApiKeyModal from "@/components/ApiKeyModal";
import { ArrowLeft, Loader2, Timer, Target, CheckCircle2, XCircle, ChevronDown, ChevronUp, BookOpen, Globe, Play, RotateCcw, Zap, Trophy } from "lucide-react";
import Link from "next/link";

type SimState = "idle"|"generating"|"active"|"submitted";

export default function SimulationPage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [simState, setSimState] = useState<SimState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
=======
import { generateQuestionsForDomain, Question } from "@/lib/gemini";
import { saveSimulationSession, getSimulationHistory, SimulationSession } from "@/lib/firestore";
import {
  ArrowLeft, Loader2, Timer, Target, CheckCircle2, XCircle,
  ChevronDown, ChevronUp, BookOpen, Globe, History, Play, RotateCcw
} from "lucide-react";
import Link from "next/link";

type SimState = "idle" | "generating" | "active" | "submitted";

export default function SimulationPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [simState, setSimState] = useState<SimState>("idle");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION_SECONDS);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SimulationSession[]>([]);
<<<<<<< HEAD
  const [expandedExp, setExpandedExp] = useState<string|null>(null);
  const [expLang, setExpLang] = useState<Record<string,"en"|"id">>({});
  const [saving, setSaving] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [xpResult, setXpResult] = useState<{xpEarned:number;newBadges:string[];newStreak:number}|null>(null);
  const timerRef = useRef<NodeJS.Timeout|null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => { if (!loading && !user) router.push("/"); }, [user, loading, router]);
  useEffect(() => { if (user) loadHistory(); }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try { setHistory(await getSimulationHistory(user.uid)); } catch(e) { console.error(e); }
=======
  const [showHistory, setShowHistory] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);
  const [explanationLang, setExplanationLang] = useState<Record<string, "en" | "id">>({});
  const [saving, setSaving] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!loading && !user) router.push("/");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const h = await getSimulationHistory(user.uid);
      setHistory(h);
    } catch (e) { console.error(e); }
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  };

  const handleSubmit = useCallback(async (timeTaken: number) => {
    if (!user || simState === "submitted") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSimState("submitted");
<<<<<<< HEAD
    const score = questions.reduce((acc,q) => acc + (answers[q.id]===q.correct?1:0), 0);
    setSaving(true);
    try {
      const result = await saveSimulationSession({ userId: user.uid, questions, answers, score, totalQuestions: questions.length, timeTaken });
      setXpResult(result);
      await refreshProfile();
      await loadHistory();
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  }, [user, simState, questions, answers, refreshProfile]);
=======

    const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);

    setSaving(true);
    try {
      await saveSimulationSession({
        userId: user.uid,
        questions,
        answers,
        score,
        totalQuestions: questions.length,
        timeTaken,
      });
      await loadHistory();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }, [user, simState, questions, answers]);
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c

  useEffect(() => {
    if (simState === "active") {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
<<<<<<< HEAD
        setTimeLeft(prev => {
          if (prev <= 1) { handleSubmit(EXAM_DURATION_SECONDS); return 0; }
=======
        setTimeLeft((prev) => {
          if (prev <= 1) {
            const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
            handleSubmit(timeTaken);
            return 0;
          }
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [simState, handleSubmit]);

<<<<<<< HEAD
  const handleStart = async () => {
    if (!getApiKey()) { setShowApiModal(true); return; }
    setSimState("generating"); setError(""); setAnswers({}); setCurrentIndex(0); setTimeLeft(EXAM_DURATION_SECONDS); setXpResult(null);
    try {
      const all: Question[] = [];
      for (const domain of ECBA_DOMAINS) {
        const qs = await generateQuestionsForDomain(domain, domain.questionCount);
        all.push(...qs);
      }
      setQuestions(all.sort(() => Math.random()-0.5));
      setSimState("active");
    } catch(e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg === "NO_API_KEY") setShowApiModal(true);
      else setError("Failed to generate simulation. Please try again.");
=======
  const handleStartSimulation = async () => {
    setSimState("generating");
    setError("");
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(EXAM_DURATION_SECONDS);

    try {
      const allQuestions: Question[] = [];
      for (const domain of ECBA_DOMAINS) {
        const qs = await generateQuestionsForDomain(domain, domain.questionCount);
        allQuestions.push(...qs);
      }
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
      setSimState("active");
    } catch (e) {
      console.error(e);
      const errMsg = e instanceof Error ? e.message : "";
      if (errMsg.includes("All models failed")) {
        setError("Gemini is currently overloaded. Already retried all models automatically — please wait a moment and try again.");
      } else {
        setError("Failed to generate simulation. Please try again.");
      }
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
      setSimState("idle");
    }
  };

<<<<<<< HEAD
  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  const score = questions.reduce((acc,q) => acc+(answers[q.id]===q.correct?1:0), 0);
  const pct = questions.length > 0 ? Math.round((score/questions.length)*100) : 0;
  const timeTaken = EXAM_DURATION_SECONDS - timeLeft;

  if (loading || !user) return null;

  if (simState === "idle") return (
    <div className="min-h-screen bg-slate-50">
      {showApiModal && <ApiKeyModal onSuccess={() => { setShowApiModal(false); handleStart(); }} />}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="font-bold text-slate-900">Exam Simulation</h1>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        {history.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-slate-900 mb-3">Recent Simulations</h3>
            {history.slice(0,3).map((s,i) => {
              const p = Math.round((s.score/s.totalQuestions)*100);
              const ts = s.createdAt as {seconds:number}|null;
              return (
                <div key={s.id||i} className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Simulation #{history.length-i}</p>
                    <p className="text-xs text-slate-400">{ts?new Date(ts.seconds*1000).toLocaleDateString("id-ID",{day:"numeric",month:"short"}):"—"}{s.xpEarned?` · +${s.xpEarned} XP`:""}</p>
                  </div>
                  <span className={`text-sm font-bold ${p>=70?"text-green-600":"text-orange-500"}`}>{p}%</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-8 text-white mb-6">
          <Target className="w-10 h-10 mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Full ECBA Simulation</h2>
          <p className="text-violet-200 mb-6">AI-generated questions mirroring the real ECBA exam.</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[{v:"50",l:"Questions"},{v:"75",l:"Minutes"},{v:"9",l:"Domains"}].map(s=>(
              <div key={s.l} className="bg-white/15 rounded-xl p-3">
                <p className="text-2xl font-bold">{s.v}</p>
                <p className="text-violet-300 text-xs">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
        <button onClick={handleStart} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg">
          <Play className="w-5 h-5" />Start Simulation
        </button>
        <p className="text-center text-xs text-slate-400 mt-3">Generation takes ~2-3 minutes for all 50 questions.</p>
      </main>
    </div>
  );

  if (simState === "generating") return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Generating your exam...</h2>
        <p className="text-slate-500 text-sm">Crafting 50 situational questions across all 9 domains.</p>
      </div>
    </div>
  );

  if (simState === "active" && questions.length > 0) {
    const q = questions[currentIndex];
    const isCritical = timeLeft < 300;
=======
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const score = questions.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const answeredCount = Object.keys(answers).length;
  const timeTakenSeconds = EXAM_DURATION_SECONDS - timeLeft;

  const toggleExplanation = (id: string) => {
    setExpandedExplanation(expandedExplanation === id ? null : id);
    if (!explanationLang[id]) setExplanationLang((prev) => ({ ...prev, [id]: "id" }));
  };

  if (loading || !user) return null;

  // ── IDLE STATE ──
  if (simState === "idle") {
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
<<<<<<< HEAD
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">Q{currentIndex+1}/{questions.length}</span>
                <span className="text-xs text-slate-400">· {Object.keys(answers).length} answered</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-violet-500 h-1.5 rounded-full transition-all" style={{width:`${((currentIndex+1)/questions.length)*100}%`}} />
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${isCritical?"bg-red-100 text-red-600":"bg-slate-100 text-slate-700"}`}>
              <Timer className="w-4 h-4" />{formatTime(timeLeft)}
            </div>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{backgroundColor:ECBA_DOMAINS.find(d=>d.number===q.domain_number)?.bgColor,color:ECBA_DOMAINS.find(d=>d.number===q.domain_number)?.color}}>
                D{q.domain_number} · {q.activity}
              </span>
            </div>
            <p className="text-slate-800 leading-relaxed mb-6">{q.question}</p>
            <div className="space-y-2.5">
              {(["A","B","C","D"] as const).map(choice => {
                const sel = answers[q.id]===choice;
                return (
                  <button key={choice} onClick={()=>setAnswers(prev=>({...prev,[q.id]:choice}))}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm flex items-center gap-3 transition-all ${sel?"border-violet-500 bg-violet-50 text-violet-800":"border-slate-200 hover:border-violet-300 text-slate-700"}`}>
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 ${sel?"border-violet-500 bg-violet-500 text-white":"border-slate-300 text-slate-500"}`}>{choice}</span>
=======
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-bold text-slate-900 flex-1">Exam Simulation</h1>
            <button onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100">
              <History className="w-4 h-4" />
              <span className="hidden sm:block">History ({history.length})</span>
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          {showHistory && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
              <h2 className="font-bold text-slate-900 mb-4">Past Simulations</h2>
              {history.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No simulations yet.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((s, i) => (
                    <div key={s.id || i} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Simulation {history.length - i}</p>
                        <p className="text-xs text-slate-400">
                          {s.createdAt ? new Date((s.createdAt as unknown as { seconds: number }).seconds * 1000).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric"
                          }) : "—"} · {Math.floor(s.timeTaken / 60)}m {s.timeTaken % 60}s
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${s.score / s.totalQuestions >= 0.7 ? "text-green-600" : "text-red-500"}`}>
                          {s.score}/{s.totalQuestions}
                        </span>
                        <p className="text-xs text-slate-400">{Math.round((s.score / s.totalQuestions) * 100)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sim Info Card */}
          <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-8 text-white mb-6">
            <Target className="w-10 h-10 mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-2">Full ECBA Simulation</h2>
            <p className="text-violet-200 mb-6">Simulates the real ECBA exam experience with AI-generated questions.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: "50", label: "Questions" },
                { value: "75", label: "Minutes" },
                { value: "9", label: "Domains" },
              ].map((s) => (
                <div key={s.label} className="bg-white/15 rounded-xl p-3">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-violet-300 text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Domain breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-slate-900 mb-3">Question Distribution</h3>
            <div className="space-y-2">
              {ECBA_DOMAINS.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded text-xs font-bold flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: d.bgColor, color: d.color }}>{d.number}</span>
                  <span className="text-sm text-slate-600 flex-1 truncate">{d.name}</span>
                  <span className="text-xs font-medium text-slate-500">{d.questionCount} soal</span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}

          <button onClick={handleStartSimulation}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg">
            <Play className="w-5 h-5" />
            Start Simulation
          </button>
          <p className="text-center text-xs text-slate-400 mt-3">
            Generation may take ~2–3 minutes for 50 questions across all domains.
          </p>
        </main>
      </div>
    );
  }

  // ── GENERATING STATE ──
  if (simState === "generating") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Generating your exam...</h2>
          <p className="text-slate-500 text-sm mb-4">
            AI is crafting 50 situational questions across all 9 ECBA domains. This may take a moment.
          </p>
          <div className="space-y-2">
            {ECBA_DOMAINS.map((d) => (
              <div key={d.id} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse" />
                Domain {d.number}: {d.name} ({d.questionCount} questions)
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── ACTIVE STATE ──
  if (simState === "active" && questions.length > 0) {
    const q = questions[currentIndex];
    const isTimeCritical = timeLeft < 300;

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Sticky Exam Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-400">· {answeredCount} answered</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-violet-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${isTimeCritical ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-700"}`}>
              <Timer className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6">
          {/* Question Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: ECBA_DOMAINS.find(d => d.number === q.domain_number)?.bgColor,
                  color: ECBA_DOMAINS.find(d => d.number === q.domain_number)?.color
                }}>
                Domain {q.domain_number}: {q.domain}
              </span>
              <span className="text-xs text-slate-400">Activity {q.activity}</span>
            </div>
            <p className="text-slate-800 leading-relaxed mb-6">{q.question}</p>

            <div className="space-y-2.5">
              {(["A", "B", "C", "D"] as const).map((choice) => {
                const isSelected = answers[q.id] === choice;
                return (
                  <button key={choice}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: choice }))}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm flex items-center gap-3 transition-all ${
                      isSelected ? "border-violet-500 bg-violet-50 text-violet-800" : "border-slate-200 hover:border-violet-300 hover:bg-violet-50 text-slate-700"
                    }`}>
                    <span className={`w-7 h-7 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isSelected ? "border-violet-500 bg-violet-500 text-white" : "border-slate-300 text-slate-500"
                    }`}>{choice}</span>
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                    {q.choices[choice]}
                  </button>
                );
              })}
            </div>
          </div>
<<<<<<< HEAD
          <div className="flex gap-3 mb-4">
            <button onClick={()=>setCurrentIndex(Math.max(0,currentIndex-1))} disabled={currentIndex===0}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm disabled:opacity-40 hover:bg-slate-50">← Prev</button>
            {currentIndex<questions.length-1
              ? <button onClick={()=>setCurrentIndex(currentIndex+1)} className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm">Next →</button>
              : <button onClick={()=>handleSubmit(timeTaken)} className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm">Submit Exam</button>
            }
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-3">Navigator</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((_,i)=>(
                <button key={i} onClick={()=>setCurrentIndex(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${i===currentIndex?"bg-violet-600 text-white":answers[questions[i].id]?"bg-green-100 text-green-700":"bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                  {i+1}
=======

          {/* Navigation */}
          <div className="flex gap-3">
            <button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-transparent">
              ← Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button onClick={() => setCurrentIndex(currentIndex + 1)}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm">
                Next →
              </button>
            ) : (
              <button onClick={() => handleSubmit(EXAM_DURATION_SECONDS - timeLeft)}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm">
                Submit Exam
              </button>
            )}
          </div>

          {/* Question Map */}
          <div className="mt-4 bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 mb-3">Question Navigator</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((_, i) => (
                <button key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                    i === currentIndex ? "bg-violet-600 text-white" :
                    answers[questions[i].id] ? "bg-green-100 text-green-700" :
                    "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}>
                  {i + 1}
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

<<<<<<< HEAD
  if (simState === "submitted") {
    const passed = pct >= 70;
=======
  // ── SUBMITTED STATE ──
  if (simState === "submitted") {
    const passed = percentage >= 70;

>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
<<<<<<< HEAD
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-900"><ArrowLeft className="w-5 h-5" /></Link>
=======
            <Link href="/dashboard" className="text-slate-400 hover:text-slate-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
            <h1 className="font-bold text-slate-900 flex-1">Simulation Results</h1>
            {saving && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          </div>
        </header>
<<<<<<< HEAD
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className={`rounded-2xl p-8 text-center mb-6 ${passed?"bg-gradient-to-br from-green-500 to-green-700":"bg-gradient-to-br from-orange-500 to-orange-700"} text-white`}>
            <p className="text-6xl font-bold mb-2">{pct}%</p>
            <p className="text-2xl font-semibold mb-1">{score}/{questions.length} correct</p>
            <p className="opacity-80 mb-4">{passed?"🎉 Great job!":"Keep practicing!"}</p>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.floor(timeTaken/60)}m {timeTaken%60}s</p>
                <p className="text-xs opacity-70">Time taken</p>
              </div>
              {xpResult && (
                <div className="text-center">
                  <p className="text-2xl font-bold flex items-center gap-1 justify-center"><Zap className="w-5 h-5" />+{xpResult.xpEarned}</p>
                  <p className="text-xs opacity-70">XP earned</p>
                </div>
              )}
            </div>
            {xpResult && xpResult.newBadges.length > 0 && (
              <div className="mt-3 bg-white/20 rounded-xl px-4 py-2">
                <p className="text-sm font-semibold">🏆 {xpResult.newBadges.length} new badge{xpResult.newBadges.length>1?"s":""} unlocked!</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-slate-900 mb-4">Performance by Domain</h3>
            {ECBA_DOMAINS.map(domain=>{
              const dqs = questions.filter(q=>q.domain_number===domain.number);
              const ds = dqs.reduce((a,q)=>a+(answers[q.id]===q.correct?1:0),0);
              const dp = dqs.length>0?Math.round((ds/dqs.length)*100):0;
              return (
                <div key={domain.id} className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center"
                      style={{backgroundColor:domain.bgColor,color:domain.color}}>{domain.number}</span>
                    <span className="text-sm text-slate-700 flex-1 truncate">{domain.name}</span>
                    <span className={`text-sm font-bold ${dp>=70?"text-green-600":"text-red-500"}`}>{ds}/{dqs.length}</span>
                  </div>
                  <div className="ml-7 bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${dp>=70?"bg-green-500":"bg-red-400"}`} style={{width:`${dp}%`}} />
                  </div>
                </div>
              );
            })}
          </div>

          <h3 className="font-bold text-slate-900 mb-4">Review All Questions</h3>
          <div className="space-y-4 mb-8">
            {questions.map((q,idx)=>{
              const ua = answers[q.id];
              const correct = ua===q.correct;
              const lang = expLang[q.id]||"id";
              return (
                <div key={q.id} className={`bg-white border rounded-2xl overflow-hidden ${correct?"border-green-200":"border-red-200"}`}>
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${correct?"bg-green-100":"bg-red-100"}`}>
                        {correct?<CheckCircle2 className="w-4 h-4 text-green-600"/>:<XCircle className="w-4 h-4 text-red-500"/>}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                            style={{backgroundColor:ECBA_DOMAINS.find(d=>d.number===q.domain_number)?.bgColor,color:ECBA_DOMAINS.find(d=>d.number===q.domain_number)?.color}}>
                            D{q.domain_number}·{q.activity}
                          </span>
                          <span className="text-xs text-slate-400">#{idx+1}</span>
                        </div>
                        <p className="text-sm text-slate-800 mb-2 leading-relaxed">{q.question}</p>
                        {(["A","B","C","D"] as const).map(c=>{
                          const isC=q.correct===c; const isU=ua===c;
                          return (
                            <p key={c} className={`text-xs flex items-center gap-1.5 mb-0.5 ${isC?"text-green-700 font-medium":isU&&!correct?"text-red-500 line-through":"text-slate-400 opacity-60"}`}>
                              <span className="w-4 h-4 rounded border flex items-center justify-center text-xs flex-shrink-0">{c}</span>
                              {q.choices[c]}
                              {isC && <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0"/>}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-slate-100">
                    <button onClick={()=>setExpandedExp(expandedExp===q.id?null:q.id)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-sm font-medium text-slate-600 hover:bg-slate-50">
                      <span className="flex items-center gap-2"><BookOpen className="w-4 h-4"/>Explanation</span>
                      {expandedExp===q.id?<ChevronUp className="w-4 h-4"/>:<ChevronDown className="w-4 h-4"/>}
                    </button>
                    {expandedExp===q.id && (
                      <div className="px-4 pb-4">
                        <button onClick={()=>setExpLang(p=>({...p,[q.id]:p[q.id]==="en"?"id":"en"}))}
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 mb-2">
                          <Globe className="w-3 h-3"/>{lang==="id"?"Switch to English":"Ganti ke Indonesia"}
                        </button>
                        <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 leading-relaxed">
                          {lang==="id"?q.explanation_id:q.explanation_en}
                        </div>
=======

        <main className="max-w-3xl mx-auto px-4 py-8">
          {/* Score Card */}
          <div className={`rounded-2xl p-8 text-center mb-8 ${passed ? "bg-gradient-to-br from-green-500 to-green-700" : "bg-gradient-to-br from-orange-500 to-orange-700"} text-white`}>
            <p className="text-6xl font-bold mb-2">{percentage}%</p>
            <p className="text-2xl font-semibold mb-1">{score}/{questions.length} correct</p>
            <p className="opacity-80 mb-4">{passed ? "🎉 Great performance!" : "Keep practicing!"}</p>
            <div className="flex justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{Math.floor(timeTakenSeconds / 60)}m {timeTakenSeconds % 60}s</p>
                <p className="text-xs opacity-70">Time taken</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{questions.length - score}</p>
                <p className="text-xs opacity-70">Incorrect</p>
              </div>
            </div>
          </div>

          {/* Domain breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6">
            <h3 className="font-bold text-slate-900 mb-4">Performance by Domain</h3>
            <div className="space-y-3">
              {ECBA_DOMAINS.map((domain) => {
                const domainQs = questions.filter(q => q.domain_number === domain.number);
                const domainScore = domainQs.reduce((acc, q) => acc + (answers[q.id] === q.correct ? 1 : 0), 0);
                const pct = domainQs.length > 0 ? Math.round((domainScore / domainQs.length) * 100) : 0;
                return (
                  <div key={domain.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: domain.bgColor, color: domain.color }}>{domain.number}</span>
                      <span className="text-sm text-slate-700 flex-1 truncate">{domain.name}</span>
                      <span className={`text-sm font-bold ${pct >= 70 ? "text-green-600" : "text-red-500"}`}>
                        {domainScore}/{domainQs.length}
                      </span>
                    </div>
                    <div className="ml-7 bg-slate-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${pct >= 70 ? "bg-green-500" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Review Questions */}
          <h3 className="font-bold text-slate-900 mb-4">Review All Questions</h3>
          <div className="space-y-4 mb-8">
            {questions.map((q, index) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correct;
              const lang = explanationLang[q.id] || "id";

              return (
                <div key={q.id} className={`bg-white border rounded-2xl overflow-hidden ${isCorrect ? "border-green-200" : "border-red-200"}`}>
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isCorrect ? "bg-green-100" : "bg-red-100"}`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: ECBA_DOMAINS.find(d => d.number === q.domain_number)?.bgColor, color: ECBA_DOMAINS.find(d => d.number === q.domain_number)?.color }}>
                            D{q.domain_number} · {q.activity}
                          </span>
                          <span className="text-xs text-slate-400">#{index + 1}</span>
                        </div>
                        <p className="text-sm text-slate-800 mb-3 leading-relaxed">{q.question}</p>
                        <div className="space-y-1.5">
                          {(["A", "B", "C", "D"] as const).map((c) => {
                            const isCorrectChoice = q.correct === c;
                            const isUserChoice = userAns === c;
                            let cls = "text-slate-500 opacity-50";
                            if (isCorrectChoice) cls = "text-green-700 font-medium";
                            else if (isUserChoice && !isCorrect) cls = "text-red-600 line-through";
                            return (
                              <p key={c} className={`text-xs flex items-center gap-2 ${cls}`}>
                                <span className="w-5 h-5 rounded flex items-center justify-center text-xs border flex-shrink-0">{c}</span>
                                {q.choices[c]}
                                {isCorrectChoice && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />}
                              </p>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100">
                    <button onClick={() => toggleExplanation(q.id)}
                      className="w-full px-5 py-3 flex items-center justify-between text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                      <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" />Explanation</span>
                      {expandedExplanation === q.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedExplanation === q.id && (
                      <div className="px-5 pb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <button onClick={() => setExplanationLang(prev => ({ ...prev, [q.id]: prev[q.id] === "en" ? "id" : "en" }))}
                            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600">
                            <Globe className="w-3.5 h-3.5" />
                            {lang === "id" ? "Switch to English" : "Ganti ke Indonesia"}
                          </button>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
                          {lang === "id" ? q.explanation_id : q.explanation_en}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">📚 {q.babok_reference}</p>
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

<<<<<<< HEAD
          <div className="space-y-3">
            <Link href="/analytics" className="block w-full bg-violet-50 border border-violet-200 text-violet-700 font-semibold py-3.5 rounded-xl text-center flex items-center justify-center gap-2">
              <Trophy className="w-4 h-4"/>View Analytics & Download Summary
            </Link>
            <button onClick={()=>{setSimState("idle");setQuestions([]);setAnswers({});setXpResult(null);}}
              className="w-full bg-white border-2 border-slate-200 hover:border-violet-300 text-slate-700 font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4"/>Start New Simulation
            </button>
          </div>
=======
          <button onClick={() => { setSimState("idle"); setQuestions([]); setAnswers({}); }}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Start New Simulation
          </button>
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
        </main>
      </div>
    );
  }
<<<<<<< HEAD
=======

>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  return null;
}
