import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Question } from "./gemini";
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  totalXP: number;
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  earnedBadges: string[];
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  domainStats: Record<string, { sessions: number; totalCorrect: number; totalQ: number }>;
}
export interface PracticeSession {
  id?: string;
  userId: string;
  domainId: string;
  domainNumber?: number;
  domainName: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTakenSeconds?: number;
  xpEarned?: number;
  completedAt: Date | null;
  createdAt: Date | null;
}

export interface SimulationSession {
  id?: string;
  userId: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  xpEarned?: number;
  completedAt: Date | null;
  createdAt: Date | null;
}

export interface SessionReward {
  xpEarned: number;
  newBadges: string[];
  newStreak: number;
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayString() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function calculateXP(score: number, totalQuestions: number, isSimulation = false) {
  const base = 10 + score * 5;
  const perfectBonus = score === totalQuestions && totalQuestions > 0 ? 20 : 0;
  const multiplier = isSimulation ? 2 : 1;
  return (base + perfectBonus) * multiplier;
}

function updateStreak(profile: UserProfile) {
  const today = todayString();
  const yesterday = yesterdayString();
  let currentStreak = profile.currentStreak || 0;

  if (profile.lastActiveDate === today) {
    return { currentStreak, bestStreak: profile.bestStreak || 0 };
  }

  if (profile.lastActiveDate === yesterday) currentStreak += 1;
  else currentStreak = 1;

  const bestStreak = Math.max(profile.bestStreak || 0, currentStreak);
  return { currentStreak, bestStreak };
}

function checkBadges(
  profile: UserProfile,
  score: number,
  totalQuestions: number,
  isSimulation = false
) {
  const earned = new Set(profile.earnedBadges || []);
  const newBadges: string[] = [];

  const award = (id: string) => {
    if (!earned.has(id)) {
      earned.add(id);
      newBadges.push(id);
    }
  };

  if ((profile.totalSessions || 0) + 1 >= 1) award("first_steps");
  if (score === totalQuestions && totalQuestions > 0) award("perfect");
  if (isSimulation) award("simulator");
  if ((profile.currentStreak || 0) >= 3) award("streak_3");
  if ((profile.currentStreak || 0) >= 7) award("streak_7");
  if ((profile.totalXP || 0) >= 500) award("xp_500");
  if ((profile.totalXP || 0) >= 1000) award("xp_1000");

  const domainCount = Object.keys(profile.domainStats || {}).length;
  if (domainCount >= 9) award("domain_explorer");

  return { earnedBadges: Array.from(earned), newBadges };
}

async function applySessionReward(
  userId: string,
  score: number,
  totalQuestions: number,
  domainId?: string,
  isSimulation = false
): Promise<SessionReward> {
  const profile = await getUserProfile(userId);
  if (!profile) throw new Error("Profile not found");

  const xpEarned = calculateXP(score, totalQuestions, isSimulation);
  const streak = updateStreak(profile);
  const domainStats = { ...(profile.domainStats || {}) };

  if (domainId) {
    const existing = domainStats[domainId] || { sessions: 0, totalCorrect: 0, totalQ: 0 };
    domainStats[domainId] = {
      sessions: existing.sessions + 1,
      totalCorrect: existing.totalCorrect + score,
      totalQ: existing.totalQ + totalQuestions,
    };
  }

  const nextProfile: UserProfile = {
    ...profile,
    totalXP: (profile.totalXP || 0) + xpEarned,
    totalSessions: (profile.totalSessions || 0) + 1,
    totalQuestions: (profile.totalQuestions || 0) + totalQuestions,
    totalCorrect: (profile.totalCorrect || 0) + score,
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    lastActiveDate: todayString(),
    domainStats,
  };

  const badgeResult = checkBadges(nextProfile, score, totalQuestions, isSimulation);
  nextProfile.earnedBadges = badgeResult.earnedBadges;

  await updateDoc(doc(db, "users", userId), {
    totalXP: nextProfile.totalXP,
    totalSessions: nextProfile.totalSessions,
    totalQuestions: nextProfile.totalQuestions,
    totalCorrect: nextProfile.totalCorrect,
    currentStreak: nextProfile.currentStreak,
    bestStreak: nextProfile.bestStreak,
    lastActiveDate: nextProfile.lastActiveDate,
    domainStats: nextProfile.domainStats,
    earnedBadges: nextProfile.earnedBadges,
  });

  return {
    xpEarned,
    newBadges: badgeResult.newBadges,
    newStreak: streak.currentStreak,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return null;
  return { uid: userId, ...(snap.data() as Omit<UserProfile, "uid">) };
}

export async function createUserProfile(userId: string, name: string, email: string): Promise<void> {
  await setDoc(doc(db, "users", userId), {
    displayName: name,
    email,
    totalXP: 0,
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    earnedBadges: [],
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: "",
    domainStats: {},
    createdAt: serverTimestamp(),
  });
}

export async function savePracticeSession(
  session: Omit<PracticeSession, "id" | "createdAt" | "completedAt">
): Promise<SessionReward> {
  const reward = await applySessionReward(
    session.userId,
    session.score,
    session.totalQuestions,
    session.domainId
  );

  const ref = collection(db, "users", session.userId, "practice_sessions");
  await addDoc(ref, {
    ...session,
    xpEarned: reward.xpEarned,
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });

  return reward;
}

export async function getPracticeHistory(
  userId: string,
  domainId: string,
  limitCount: number = 10
): Promise<PracticeSession[]> {
  const ref = collection(db, "users", userId, "practice_sessions");
  const q = query(ref, orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...(item.data() as Omit<PracticeSession, "id">),
    }))
    .filter((session) => session.domainId === domainId);
}

export async function saveSimulationSession(
  session: Omit<SimulationSession, "id" | "createdAt" | "completedAt">
): Promise<SessionReward> {
  const reward = await applySessionReward(
    session.userId,
    session.score,
    session.totalQuestions,
    undefined,
    true
  );

  const ref = collection(db, "users", session.userId, "simulations");
  await addDoc(ref, {
    ...session,
    xpEarned: reward.xpEarned,
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });

  return reward;
}

export async function getSimulationHistory(
  userId: string,
  limitCount: number = 10
): Promise<SimulationSession[]> {
  const ref = collection(db, "users", userId, "simulations");
  const q = query(ref, orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<SimulationSession, "id">),
  }));
}

export async function getTodaySessions(userId: string) {
  const today = todayString();
  const startOfDay = new Date(`${today}T00:00:00`);
  const endOfDay = new Date(`${today}T23:59:59.999`);

  const [practiceSnap, simulationSnap] = await Promise.all([
    getDocs(query(collection(db, "users", userId, "practice_sessions"), orderBy("createdAt", "desc"), limit(20))),
    getDocs(query(collection(db, "users", userId, "simulations"), orderBy("createdAt", "desc"), limit(10))),
  ]);

  const isToday = (value: unknown) => {
    if (!value || typeof value !== "object" || !("seconds" in value)) return false;
    const seconds = (value as { seconds: number }).seconds;
    const date = new Date(seconds * 1000);
    return date >= startOfDay && date <= endOfDay;
  };

  return {
    practices: practiceSnap.docs
      .map((item) => item.data())
      .filter((session) => isToday(session.createdAt)),
    simulations: simulationSnap.docs
      .map((item) => item.data())
      .filter((session) => isToday(session.createdAt)),
  };
}

export async function getSessionDetail(
  userId: string,
  sessionId: string,
  type: "practice_sessions" | "simulations"
): Promise<PracticeSession | SimulationSession | null> {
  const ref = doc(db, "users", userId, type, sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as PracticeSession | SimulationSession;
}
