import {
  collection, addDoc, getDocs, query, orderBy,
  limit, serverTimestamp, doc, getDoc, setDoc, updateDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { Question } from "./gemini";
import { BADGES, XP_PER_CORRECT, XP_PER_WRONG, XP_STREAK_BONUS } from "./domains";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string;
  totalSessions: number;
  totalQuestions: number;
  totalCorrect: number;
  earnedBadges: string[];
  domainStats: Record<string, { sessions: number; totalQ: number; totalCorrect: number }>;
  createdAt: unknown;
}

export interface PracticeSession {
  id?: string;
  userId: string;
  domainId: string;
  domainNumber: number;
  domainName: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  timeTakenSeconds: number;
  createdAt: unknown;
}

export interface SimulationSession {
  id?: string;
  userId: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  xpEarned: number;
  createdAt: unknown;
}

// Get or create user profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function createUserProfile(uid: string, displayName: string, email: string): Promise<void> {
  const ref = doc(db, "users", uid);
  const profile: Omit<UserProfile, "createdAt"> & { createdAt: unknown } = {
    uid, displayName, email,
    totalXP: 0, currentStreak: 0, bestStreak: 0,
    lastActiveDate: "",
    totalSessions: 0, totalQuestions: 0, totalCorrect: 0,
    earnedBadges: [], domainStats: {},
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, profile);
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function calculateXP(correct: number, total: number, streak: number): number {
  const base = correct * XP_PER_CORRECT + (total - correct) * XP_PER_WRONG;
  const streakBonus = streak >= 7 ? XP_STREAK_BONUS * 2 : streak >= 3 ? XP_STREAK_BONUS : 0;
  return base + streakBonus;
}

function checkNewBadges(profile: UserProfile, sessionScore: number, sessionTotal: number, timeSecs: number): string[] {
  const earned = new Set(profile.earnedBadges);
  const newBadges: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !earned.has(id)) { newBadges.push(id); earned.add(id); }
  };

  check("first_blood", profile.totalSessions === 0);
  check("perfect_five", sessionScore === sessionTotal && sessionTotal >= 5);
  check("speed_demon", sessionTotal >= 5 && timeSecs < 180);
  check("streak_3", profile.currentStreak >= 3);
  check("streak_7", profile.currentStreak >= 7);
  check("streak_30", profile.currentStreak >= 30);
  check("century", profile.totalQuestions + sessionTotal >= 100);
  check("sim_pass", sessionScore / sessionTotal >= 0.7 && sessionTotal === 50);
  check("all_domains", Object.keys(profile.domainStats).length >= 9);

  return newBadges;
}

async function updateProfileAfterSession(
  uid: string,
  score: number,
  total: number,
  domainId: string | null,
  domainNumber: number | null,
  timeSecs: number,
): Promise<{ xpEarned: number; newBadges: string[]; newStreak: number }> {
  const profileRef = doc(db, "users", uid);
  const snap = await getDoc(profileRef);
  const profile = snap.data() as UserProfile;

  const today = todayString();
  const yesterday = yesterdayString();

  let newStreak = profile.currentStreak;
  if (profile.lastActiveDate === today) {
    // already active today, streak unchanged
  } else if (profile.lastActiveDate === yesterday) {
    newStreak = profile.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const xpEarned = calculateXP(score, total, newStreak);
  const newBadges = checkNewBadges({ ...profile, currentStreak: newStreak }, score, total, timeSecs);

  const domainStats = { ...profile.domainStats };
  if (domainId) {
    const existing = domainStats[domainId] || { sessions: 0, totalQ: 0, totalCorrect: 0 };
    domainStats[domainId] = {
      sessions: existing.sessions + 1,
      totalQ: existing.totalQ + total,
      totalCorrect: existing.totalCorrect + score,
    };
  }

  await updateDoc(profileRef, {
    totalXP: profile.totalXP + xpEarned,
    currentStreak: newStreak,
    bestStreak: Math.max(profile.bestStreak, newStreak),
    lastActiveDate: today,
    totalSessions: profile.totalSessions + 1,
    totalQuestions: profile.totalQuestions + total,
    totalCorrect: profile.totalCorrect + score,
    earnedBadges: [...profile.earnedBadges, ...newBadges],
    domainStats,
  });

  return { xpEarned, newBadges, newStreak };
}

export async function savePracticeSession(
  session: Omit<PracticeSession, "id" | "createdAt" | "xpEarned">
): Promise<{ sessionId: string; xpEarned: number; newBadges: string[]; newStreak: number }> {
  const { xpEarned, newBadges, newStreak } = await updateProfileAfterSession(
    session.userId, session.score, session.totalQuestions,
    session.domainId, session.domainNumber, session.timeTakenSeconds
  );

  const ref = collection(db, "users", session.userId, "practice_sessions");
  const docRef = await addDoc(ref, { ...session, xpEarned, createdAt: serverTimestamp() });

  return { sessionId: docRef.id, xpEarned, newBadges, newStreak };
}

export async function saveSimulationSession(
  session: Omit<SimulationSession, "id" | "createdAt" | "xpEarned">
): Promise<{ sessionId: string; xpEarned: number; newBadges: string[]; newStreak: number }> {
  const { xpEarned, newBadges, newStreak } = await updateProfileAfterSession(
    session.userId, session.score, session.totalQuestions, null, null, session.timeTaken
  );

  const ref = collection(db, "users", session.userId, "simulations");
  const docRef = await addDoc(ref, { ...session, xpEarned, createdAt: serverTimestamp() });

  // check sim badge
  const profileRef = doc(db, "users", session.userId);
  const snap = await getDoc(profileRef);
  const profile = snap.data() as UserProfile;
  if (!profile.earnedBadges.includes("sim_first")) {
    await updateDoc(profileRef, { earnedBadges: [...profile.earnedBadges, "sim_first"] });
    newBadges.push("sim_first");
  }

  return { sessionId: docRef.id, xpEarned, newBadges, newStreak };
}

export async function getPracticeHistory(userId: string, domainId: string, limitCount = 10): Promise<PracticeSession[]> {
  const ref = collection(db, "users", userId, "practice_sessions");
  const q = query(ref, orderBy("createdAt", "desc"), limit(limitCount * 3));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as PracticeSession))
    .filter(s => s.domainId === domainId)
    .slice(0, limitCount);
}

export async function getSimulationHistory(userId: string, limitCount = 10): Promise<SimulationSession[]> {
  const ref = collection(db, "users", userId, "simulations");
  const q = query(ref, orderBy("createdAt", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SimulationSession));
}

// Get today's sessions for daily summary
export async function getTodaySessions(userId: string): Promise<{
  practices: PracticeSession[];
  simulations: SimulationSession[];
}> {
  const today = todayString();

  const pRef = collection(db, "users", userId, "practice_sessions");
  const pSnap = await getDocs(query(pRef, orderBy("createdAt", "desc"), limit(50)));
  const practices = pSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as PracticeSession))
    .filter(s => {
      const ts = s.createdAt as { seconds: number } | null;
      if (!ts?.seconds) return false;
      return new Date(ts.seconds * 1000).toISOString().slice(0, 10) === today;
    });

  const sRef = collection(db, "users", userId, "simulations");
  const sSnap = await getDocs(query(sRef, orderBy("createdAt", "desc"), limit(10)));
  const simulations = sSnap.docs
    .map(d => ({ id: d.id, ...d.data() } as SimulationSession))
    .filter(s => {
      const ts = s.createdAt as { seconds: number } | null;
      if (!ts?.seconds) return false;
      return new Date(ts.seconds * 1000).toISOString().slice(0, 10) === today;
    });

  return { practices, simulations };
}

export { BADGES };
