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
} from "firebase/firestore";
import { db } from "./firebase";
import { Question } from "./gemini";

export interface PracticeSession {
  id?: string;
  userId: string;
  domainId: string;
  domainName: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
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
  completedAt: Date | null;
  createdAt: Date | null;
}

// Save practice session
export async function savePracticeSession(
  session: Omit<PracticeSession, "id" | "createdAt" | "completedAt">
): Promise<string> {
  const ref = collection(
    db,
    "users",
    session.userId,
    "practice_sessions"
  );
  const docRef = await addDoc(ref, {
    ...session,
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get practice history per domain
export async function getPracticeHistory(
  userId: string,
  domainId: string,
  limitCount: number = 10
): Promise<PracticeSession[]> {
  const ref = collection(db, "users", userId, "practice_sessions");
  const q = query(
    ref,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<PracticeSession, "id">),
    }))
    .filter((s) => s.domainId === domainId);
}

// Save simulation session
export async function saveSimulationSession(
  session: Omit<SimulationSession, "id" | "createdAt" | "completedAt">
): Promise<string> {
  const ref = collection(db, "users", session.userId, "simulations");
  const docRef = await addDoc(ref, {
    ...session,
    createdAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get simulation history
export async function getSimulationHistory(
  userId: string,
  limitCount: number = 10
): Promise<SimulationSession[]> {
  const ref = collection(db, "users", userId, "simulations");
  const q = query(ref, orderBy("createdAt", "desc"), limit(limitCount));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<SimulationSession, "id">),
  }));
}

// Get single session detail
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
