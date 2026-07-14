import { GoogleGenerativeAI } from "@google/generative-ai";
import { Domain, ECBA_TECHNIQUES } from "./domains";

export interface Question {
  id: string;
  question: string;
  choices: { A: string; B: string; C: string; D: string; };
  correct: "A" | "B" | "C" | "D";
  explanation_en: string;
  explanation_id: string;
  domain: string;
  domain_number: number;
  activity: string;
  babok_reference: string;
}

const MODEL_FALLBACKS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
];

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gemini_api_key");
}

export function saveApiKey(key: string): void {
  localStorage.setItem("gemini_api_key", key);
}

export function removeApiKey(): void {
  localStorage.removeItem("gemini_api_key");
}

export async function validateApiKey(key: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    await model.generateContent("Say OK");
    return true;
  } catch {
    return false;
  }
}

async function callWithRetry(prompt: string, maxRetries = 3): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("NO_API_KEY");

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: Error | null = null;

  for (const modelName of MODEL_FALLBACKS) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const msg = lastError.message || "";
        const isRetryable = ["503", "429", "high demand", "overloaded", "UNAVAILABLE", "quota", "Resource has been exhausted"].some(e => msg.includes(e));
        if (!isRetryable) throw lastError;
        if (attempt < maxRetries - 1) {
          await delay(Math.pow(2, attempt + 1) * 1000);
        }
      }
    }
  }
  throw new Error(`All models failed. Last: ${lastError?.message}`);
}

function buildPrompt(domain: Domain, count: number): string {
  const activitiesText = domain.activities.map(a => `- ${a.id}: ${a.text}`).join("\n");
  const techniques = ECBA_TECHNIQUES.slice(0, 8).join(", ");

  return `You are an ECBA exam question generator. ECBA is an ENTRY-LEVEL certification for junior BAs with 0-2 years experience.

Generate exactly ${count} situational MCQs for Domain ${domain.number}: ${domain.name}

Activities: ${activitiesText}

STRICT RULES:
- Scenario: MAX 2 sentences. Short and direct.
- Question stem: 1 simple sentence.
- ECBA is ENTRY-LEVEL — test foundational understanding, NOT advanced analysis
- Each answer choice: MAX 1 short sentence
- One clearly correct answer based on BABOK fundamentals
- Wrong choices plausible but clearly less appropriate
Techniques to reference: ${techniques}

Return ONLY valid JSON array, no markdown:
[{"question":"Short 2-3 sentence scenario + simple question.","choices":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation_en":"A is correct because [simple BABOK reason]. Others less appropriate because [brief].","explanation_id":"A benar karena [alasan BABOK]. Lainnya kurang tepat karena [singkat].","domain":"${domain.name}","domain_number":${domain.number},"activity":"X.X","babok_reference":"Domain ${domain.number}, Activity X.X"}]`;
}

export async function generateQuestionsForDomain(domain: Domain, count = 5): Promise<Question[]> {
  const text = await callWithRetry(buildPrompt(domain, count));
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const questions: Question[] = JSON.parse(clean);
  return questions.map((q, i) => ({ ...q, id: `${domain.id}_${Date.now()}_${i}` }));
}

export async function generateSimulationQuestions(domains: Domain[]): Promise<Question[]> {
  const all: Question[] = [];
  for (const domain of domains) {
    try {
      const qs = await generateQuestionsForDomain(domain, domain.questionCount);
      all.push(...qs);
    } catch (e) { console.error(`Error generating ${domain.name}:`, e); }
  }
  return all.sort(() => Math.random() - 0.5);
}
