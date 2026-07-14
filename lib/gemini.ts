import { GoogleGenerativeAI } from "@google/generative-ai";
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

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

// Model fallback list — kalau satu overload, coba yang berikutnya
const MODEL_FALLBACKS = [
  "gemini-2.5-flash-lite",   // Paling ringan, cocok buat repetisi
  "gemini-2.5-flash",        // Lebih stabil, fallback 1
  "gemini-2.5-pro",          // Paling canggih, fallback 2
];

// Delay helper
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Retry dengan exponential backoff
async function callWithRetry(
  prompt: string,
  maxRetries: number = 4
): Promise<string> {
  let lastError: Error | null = null;

  for (let modelIndex = 0; modelIndex < MODEL_FALLBACKS.length; modelIndex++) {
    const modelName = MODEL_FALLBACKS[modelIndex];
    
    // SETUP KHUSUS: Bikin AI nggak "liar" dan output konsisten
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.2, // Rendah = lebih faktual, logis, tidak berimajinasi liar
        topP: 0.8,
        topK: 40,
        responseMimeType: "application/json", // Paksa output HANYA JSON valid
      }
    });

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const errMsg = lastError.message || "";

        // Kalau 503 (overload) atau 429 (rate limit) → retry
        const isRetryable =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("429") ||
          errMsg.includes("quota") ||
          errMsg.includes("overloaded") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("Resource has been exhausted");

        if (!isRetryable) {
          // Error lain (misal API key salah, input ga valid) → langsung lempar
          throw lastError;
        }

        if (attempt < maxRetries - 1) {
          // Exponential backoff: 2s, 4s, 8s, 16s
          const waitMs = Math.pow(2, attempt + 1) * 1000;
          console.warn(
            `[Gemini] ${modelName} attempt ${attempt + 1} failed (${errMsg.slice(0, 60)}...). Retrying in ${waitMs / 1000}s...`
          );
          await delay(waitMs);
        } else {
          console.warn(
            `[Gemini] ${modelName} exhausted after ${maxRetries} attempts. Trying next model...`
          );
        }
      }
    }
  }

  // Semua model dan semua retry gagal
  throw new Error(
    `All models failed after retries. Last error: ${lastError?.message}`
  );
}

function buildDomainPrompt(domain: Domain, count: number = 5): string {
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

export async function generateQuestionsForDomain(
  domain: Domain,
  count: number = 5
): Promise<Question[]> {
  const prompt = buildDomainPrompt(domain, count);
  const text = await callWithRetry(prompt);

  let questions: Question[] = [];
  try {
    // Karena pakai responseMimeType JSON, teks yang keluar sudah pasti format JSON.
    // Tapi kita tetap pasang regex pembersih berjaga-jaga jika ada anomali.
    const cleanText = text
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    questions = JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse Gemini output to JSON:", error);
    console.error("Raw output from Gemini:", text);
    throw new Error("AI returned malformed JSON data. Please try again.");
  }

  return questions.map((q, i) => ({
    ...q,
    id: `${domain.id}_${Date.now()}_${i}`,
  }));
}

export async function generateSimulationQuestions(
  domains: Domain[]
): Promise<Question[]> {
  const allQuestions: Question[] = [];

  // Looping satu per satu agar limit RPD (Requests Per Minute) Gemini API aman
  for (const domain of domains) {
    try {
      const questions = await generateQuestionsForDomain(
        domain,
        domain.questionCount
      );
      allQuestions.push(...questions);
    } catch (error) {
      console.error(`Error generating for ${domain.name}:`, error);
    }
  }

  // Acak urutan pertanyaan
  return allQuestions.sort(() => Math.random() - 0.5);
}