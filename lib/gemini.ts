import { GoogleGenAI } from "@google/genai";
import { auth } from "@/lib/firebase";
import { Domain } from "./domains";
import { DEFAULT_MODELS, generateQuestions, type Question } from "./geminiCore";

export type { Question };

/* ---------------------------------------------------------------
   API key (BYOK): disimpan hanya di browser user (localStorage).
   Tidak ada fallback ke NEXT_PUBLIC_GEMINI_API_KEY, karena semua
   variabel NEXT_PUBLIC_* ikut ke bundle browser dan bisa dibaca siapa saja.
---------------------------------------------------------------- */
const API_KEY_STORAGE = "ecba_gemini_api_key";

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(API_KEY_STORAGE);
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function removeApiKey(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(API_KEY_STORAGE);
}

export async function validateApiKey(key: string): Promise<boolean> {
  const ai = new GoogleGenAI({ apiKey: key });

  for (const model of DEFAULT_MODELS) {
    try {
      await ai.models.generateContent({
        model,
        contents: "Say OK",
        config: { maxOutputTokens: 16 },
      });
      return true;
    } catch (err) {
      const e = err as { status?: number; message?: string };
      const msg = (e?.message || "").toLowerCase();

      if (e?.status === 429) return true; // key valid, hanya kena limit
      if (e?.status === 401 || e?.status === 403) return false;
      if (e?.status === 400 && (msg.includes("api key") || msg.includes("api_key"))) return false;
      // 404 / server sibuk / lainnya: coba model berikutnya
    }
  }
  return false;
}

/* ---------------------------------------------------------------
   Mode demo (opsional, aktif setelah /api/generate dipasang):
   user login tanpa API key -> request lewat server, key demo
   disimpan di server dan tidak pernah dikirim ke browser.
---------------------------------------------------------------- */
async function generateViaDemo(domain: Domain, count: number): Promise<Question[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("NO_API_KEY");

  const token = await user.getIdToken();
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ domainId: domain.id, count }),
  });

  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error === "GLOBAL_LIMIT" ? "DEMO_GLOBAL_LIMIT" : "DEMO_USER_LIMIT");
  }
  if (!res.ok) throw new Error("All models failed (demo server)");

  const data = await res.json();
  return data.questions as Question[];
}

/* ---------------------------------------------------------------
   API publik yang dipakai halaman
---------------------------------------------------------------- */
export async function generateQuestionsForDomain(
  domain: Domain,
  count: number = 5
): Promise<Question[]> {
  const key = getApiKey();
  if (key) return generateQuestions(key, domain, count); // BYOK: langsung ke Google
  return generateViaDemo(domain, count);                  // tanpa key: lewat server demo
}

export async function generateSimulationQuestions(
  domains: Domain[]
): Promise<Question[]> {
  const allQuestions: Question[] = [];

  // Satu per satu supaya batas request per menit Gemini aman
  for (const domain of domains) {
    try {
      const questions = await generateQuestionsForDomain(domain, domain.questionCount);
      allQuestions.push(...questions);
    } catch (error) {
      console.error(`Error generating for ${domain.name}:`, error);
    }
  }

  // Acak urutan pertanyaan
  return allQuestions.sort(() => Math.random() - 0.5);
}