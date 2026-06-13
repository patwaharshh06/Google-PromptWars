import { GoogleGenerativeAI } from "@google/generative-ai";
import type { JournalInput } from "./validation";

export interface AnalysisResult {
  emotionalSummary: string;
  detectedTriggers: string[];
  patternAnalysis: string;
  riskAssessment: {
    level: "Low Risk" | "Moderate Risk" | "High Risk";
    reasoning: string;
  };
  copingStrategies: string[];
  motivation: string;
  actionPlan: {
    today: string;
    thisWeek: string;
    beforeExam: string;
  };
  distressWarningDetected: boolean;
}

const SYSTEM_INSTRUCTION = `You are ExamMind AI, a compassionate and emotionally intelligent digital companion for students preparing for high-pressure competitive exams (like JEE, NEET, UPSC, CAT, CUET, GATE).
Your role is to analyze journal entries and provide emotional awareness and practical, contextual support.

Strict Guidelines:
1. You are a digital companion, NOT a therapist, doctor, or counselor.
2. NEVER diagnose mental illness.
3. NEVER claim to be a doctor or medical professional.
4. DO NOT provide clinical/medical advice.
5. If severe distress indicators (e.g., self-harm thoughts, extreme hopelessness, severe panic, depression symptoms, expressions of wanting to give up entirely) are detected, set "distressWarningDetected" to true and include a gentle, warm warning encouraging them to contact trusted loved ones and reach out to professional counseling services or help lines.
6. Provide supportive, realistic encouragement. Avoid toxic positivity or exaggerated claims.
7. Return your response strictly as a single JSON object matching this schema:
{
  "emotionalSummary": "A concise summary of their current emotional state based on their scores and journal entry.",
  "detectedTriggers": ["trigger 1", "trigger 2", ...],
  "patternAnalysis": "Analysis of recurring emotional patterns, themes, or core fears shown in the journal.",
  "riskAssessment": {
    "level": "Low Risk" | "Moderate Risk" | "High Risk",
    "reasoning": "Reason for this risk classification based on mood, energy, stress, and journal text."
  },
  "copingStrategies": [
    "practical action-oriented strategy 1",
    "practical action-oriented strategy 2",
    ...
  ],
  "motivation": "Compassionate, realistic, and motivating encouragement.",
  "actionPlan": {
    "today": "One small, immediate action they can do today.",
    "thisWeek": "One improvement action they can take this week.",
    "beforeExam": "One long-term recommendation for their preparation or mindset before the exam."
  },
  "distressWarningDetected": boolean
}`;

export function getApiKey(): string | null {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && envKey.trim() !== "" && envKey !== "YOUR_API_KEY_HERE") {
    return envKey;
  }
  return localStorage.getItem("exammind_api_key");
}

export function saveApiKey(key: string): void {
  localStorage.setItem("exammind_api_key", key);
}

export function clearApiKey(): void {
  localStorage.removeItem("exammind_api_key");
}

export function buildPrompt(input: JournalInput): string {
  return `Analyze the following student wellbeing details:
- Student Name: ${input.name || "Anonymous student"}
- Exam Preparing For: ${input.examType}
- Days Remaining Until Exam: ${input.daysRemaining} days
- Mood Score (1-10): ${input.moodScore} (where 10 is excellent, 1 is extremely low)
- Energy Score (1-10): ${input.energyScore} (where 10 is full of energy, 1 is exhausted)
- Stress Level (1-10): ${input.stressScore} (where 10 is high stress, 1 is calm)

Daily Journal Entry:
"${input.journalEntry}"

Provide the structured mental wellness feedback report in the requested JSON format. Ensure all advice aligns with your guidelines (non-diagnostic, non-medical, and offers distress helpline references if distressWarningDetected is true).`;
}

export async function analyzeWellbeing(input: JournalInput): Promise<AnalysisResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      "API Key Missing: Please set VITE_GEMINI_API_KEY in your environment, or configure it in the app settings."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const prompt = buildPrompt(input);

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    if (!text) {
      throw new Error("Received an empty response from Gemini API.");
    }

    try {
      const parsed: AnalysisResult = JSON.parse(text);
      
      // Basic runtime structural checks
      if (
        typeof parsed.emotionalSummary !== "string" ||
        !Array.isArray(parsed.detectedTriggers) ||
        typeof parsed.patternAnalysis !== "string" ||
        !parsed.riskAssessment ||
        !["Low Risk", "Moderate Risk", "High Risk"].includes(parsed.riskAssessment.level) ||
        !Array.isArray(parsed.copingStrategies) ||
        typeof parsed.motivation !== "string" ||
        !parsed.actionPlan ||
        typeof parsed.actionPlan.today !== "string" ||
        typeof parsed.actionPlan.thisWeek !== "string" ||
        typeof parsed.actionPlan.beforeExam !== "string"
      ) {
        throw new Error("API response JSON structure is invalid or incomplete.");
      }

      return parsed;
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Raw response:", text);
      throw new Error("Failed to parse analysis report. The model output did not match the expected format.", { cause: parseError });
    }
  } catch (apiError) {
    console.error("Gemini API error:", apiError);
    const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
    if (errorMessage.includes("API_KEY_INVALID")) {
      throw new Error("Invalid API Key: The Gemini API key provided is not valid. Please check it and try again.", { cause: apiError });
    }
    throw new Error(errorMessage || "An unexpected error occurred while communicating with the Gemini AI.", { cause: apiError });
  }
}
