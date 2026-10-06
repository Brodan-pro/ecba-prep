import { GoogleGenAI } from "@google/genai";
import { Domain, ECBA_TECHNIQUES } from "./domains";

export interface Question {
  id: string;
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct: "A" | "B" | "C" | "D";
  explanation_en: string;
  explanation_id: string;
  domain: string;
  domain_number: number;
  activity: string;
  babok_reference: string;
}

// Urutan model: dicoba dari atas, kalau gagal pindah ke bawah.
// Seri 2.5 sengaja tidak dipakai: sejak 18 Sep 2026 aksesnya dibatasi untuk
// project yang sudah pernah memakainya, dan Google menyarankan 3.5 Flash-Lite / 3.8 Flash.
// Cek ID terbaru di https://ai.google.dev/gemini-api/docs/models
export const DEFAULT_MODELS = [
  "gemini-3.5-flash-lite", // utama: stabil, ringan, cocok untuk generate berulang
  "gemini-3.8-flash",      // fallback 1: lebih kuat
  "gemini-3.1-flash-lite", // fallback 2: generasi sebelumnya (GA)
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

type ErrorKind = "overload" | "skip-model" | "fatal";

function classifyError(err: unknown): ErrorKind {
  const e = err as { status?: number; message?: string };
  const msg = (e?.message || String(err)).toLowerCase();

  // Kuota habis / model tidak ada / model dimatikan -> langsung coba model berikutnya
  if (
    e?.status === 429 ||
    e?.status === 404 ||
    msg.includes("resource_exhausted") ||
    msg.includes("quota") ||
    msg.includes("not found") ||
    msg.includes("shut down") ||
    msg.includes("no longer available")
  ) {
    return "skip-model";
  }

  // Server sibuk -> retry dengan backoff
  if (
    e?.status === 500 ||
    e?.status === 503 ||
    msg.includes("unavailable") ||
    msg.includes("overloaded") ||
    msg.includes("high demand")
  ) {
    return "overload";
  }

  // API key salah, request tidak valid, dll -> langsung lempar
  return "fatal";
}

export async function callGemini(
  apiKey: string,
  prompt: string,
  models: string[] = DEFAULT_MODELS,
  maxRetries: number = 3
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  let lastError: Error | null = null;

  for (const model of models) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            topP: 0.8,
            topK: 40,
            responseMimeType: "application/json", // paksa output JSON valid
          },
        });
        const text = response.text ?? "";
        if (!text) throw new Error("UNAVAILABLE: empty response");
        return text;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const kind = classifyError(err);

        if (kind === "fatal") throw lastError;

        if (kind === "skip-model") {
          console.warn(`[Gemini] ${model} tidak bisa dipakai, pindah ke model berikutnya.`);
          break;
        }

        if (attempt < maxRetries - 1) {
          const waitMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s
          console.warn(`[Gemini] ${model} sibuk, retry dalam ${waitMs / 1000}s...`);
          await delay(waitMs);
        }
      }
    }
  }

  // Teks "All models failed" dipakai oleh halaman practice
  throw new Error(`All models failed after retries. Last error: ${lastError?.message}`);
}

export function buildDomainPrompt(domain: Domain, count: number = 5): string {
  const activitiesText = domain.activities
    .map((a) => `- ${a.id}: ${a.text}`)
    .join("\n");

  const techniquesText = ECBA_TECHNIQUES.slice(0, 10).join(", ");

  return `You are an expert ECBA (Entry Certificate in Business Analysis) exam question generator based on the IIBA BABOK Guide and Business Analysis Standard.

Generate exactly ${count} high-quality, situation-based multiple choice questions for:
Domain ${domain.number}: ${domain.name} (${domain.weight}% of ECBA exam)

Activity Statements to cover:
${activitiesText}

Requirements for each question:
1. Write a BRIEF and DIRECT workplace scenario (1-3 sentences max) suitable for a junior BA.
2. Focus on practical application and understanding of foundational-level concepts, not complex multi-step analysis.
3. Four answer choices (A, B, C, D) - only ONE is correct. Keep choices concise.
4. Difficulty: Foundational (Entry Level). Avoid highly tricky, ambiguous, or convoluted scenarios (do NOT write CBAP-level questions).
5. Reference relevant BABOK techniques when applicable: ${techniquesText}
6. Explanations must be straightforward, directly linking the correct action to the BABOK standard.

CRITICAL INSTRUCTION: Return a JSON array. Structure it exactly like this:
[
  {
    "question": "You are a junior BA at a retail company. The sponsor asks you to organize a session to generate a high volume of new ideas. Which technique should you use?",
    "choices": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "correct": "A",
    "explanation_en": "A is correct because... [brief explanation referencing BABOK concepts]. B, C, D are incorrect because...",
    "explanation_id": "A benar karena... [penjelasan singkat Bahasa Indonesia]. B, C, D salah karena...",
    "domain": "${domain.name}",
    "domain_number": ${domain.number},
    "activity": "X.X",
    "babok_reference": "Domain ${domain.number}, Activity X.X - [activity description]"
  }
]`;
}

export async function generateQuestions(
  apiKey: string,
  domain: Domain,
  count: number = 5,
  models: string[] = DEFAULT_MODELS
): Promise<Question[]> {
  const text = await callGemini(apiKey, buildDomainPrompt(domain, count), models);

  let parsed: Omit<Question, "id">[];
  try {
    // Output sudah JSON karena responseMimeType, pembersih ini cuma berjaga-jaga
    const cleanText = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();
    parsed = JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse Gemini output to JSON:", error);
    console.error("Raw output from Gemini:", text);
    throw new Error("AI returned malformed JSON data. Please try again.");
  }

  return parsed.map((q, i) => ({
    ...q,
    id: `${domain.id}_${Date.now()}_${i}`,
  }));
}