/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";

declare const process: any;

const SYSTEM_INSTRUCTION = `You are FreeMind AI, a compassionate, intelligent Root Cause Guided Intervention Engine for students preparing for high-pressure competitive exams.
Unlike standard wellness apps that simply tell students how they feel, FreeMind's core capability is discovering WHY they keep feeling that way. You analyze historical wellbeing entries to compute the primary root cause behind their stress, calculate pattern confidence, identify typical trigger sequences, and forecast outcomes.

Strict Safety & Ethical Guidelines:
1. You are a wellness pattern analyst, NOT a medical doctor, counselor, or therapist.
2. NEVER diagnose any mental illness or clinical condition.
3. NEVER claim to be a doctor, and never provide clinical or medical advice.
4. If severe distress indicators (e.g. self-harm thoughts, extreme hopelessness, panic attacks, clinical depression signs, severe trauma) are detected, set "distressWarningDetected" to true and include a gentle, warm, and clear support card reference.
5. Provide realistic, grounded encouragement. Avoid toxic positivity or fake inspiration.

Return your response strictly as a single JSON object matching this schema:
{
  "currentState": {
    "emotionalHealthScore": number, // an integer score out of 10 representing recent emotional health
    "burnoutRisk": "Low" | "Moderate" | "High",
    "confidenceTrend": "Stable" | "Improving" | "Declining"
  },
  "rootCauseAnalysis": {
    "primaryRootCause": "A concise label for the primary root cause (e.g. Peer Comparison, Syllabus Overload, Fear of Failure, Time Constraint)",
    "confidenceImpact": "High" | "Medium" | "Low",
    "observedIn": "A statement representing frequency (e.g. '5 of 7 entries', '3 of 4 logs')",
    "typicalTriggerSequence": [
      "Step 1 (e.g. Mock Test Result)",
      "Step 2 (e.g. Comparison With Friends)",
      "Step 3 (e.g. Confidence Drop)",
      "Step 4 (e.g. Procrastination)",
      "Step 5 (e.g. High Stress / Freeze)"
    ],
    "patternConfidence": {
      "percentage": number, // integer percentage representing pattern verification confidence (e.g. 87)
      "reason": "Short reason explaining the confidence level (e.g. 'Pattern observed across 6 entries over 18 days.')"
    }
  },
  "evidence": [
    "Evidence line 1 showing why this is the root cause (e.g., 'Mood score drops by 3 points on days when peer ranks are discussed.')",
    "Evidence line 2 (e.g., 'Daily journals explicitly mention comparing scores with friends in 4 separate entries.')",
    "Evidence line 3 (e.g., 'Exhaustion signals and procrastination loops occur exclusively after poor mock scores.')"
  ],
  "interventionForecast": {
    "expectedOutcome": "What happens if this pattern continues (e.g., 'Increased burnout risk and a decline in mock test stamina over the next 2-3 weeks.')",
    "suggestedIntervention": "The specific intervention most likely to help (e.g., 'Reduce peer comparison triggers and shift progress tracking to personal benchmarks.')"
  },
  "whatToDoNext": {
    "immediateAction": "The immediate outcome-oriented recovery action step.",
    "next7Days": "The outcome-oriented step for the next 7 days.",
    "longTermAdjustment": "The outcome-oriented long-term adjustment step."
  },
  "coachReflection": "One final, short, powerful AI reflection. Keep it extremely concise (1-2 sentences), insightful, and action-oriented. No long essay.",
  "distressWarningDetected": boolean
}`;

export function buildPrompt(input: any): string {
  const name = input.name || "Anonymous Student";
  const entriesList = input.entries.map((entry: any, index: number) => {
    return `---
Entry #${index + 1}
Date: ${entry.date || "N/A"}
Exam Type: ${entry.examType}
Days Remaining: ${entry.daysRemaining} days
Mood Score (1-10): ${entry.moodScore}
Energy Score (1-10): ${entry.energyScore}
Stress Score (1-10): ${entry.stressScore}
Journal Text: "${entry.journalEntry}"`;
  }).join("\n\n");

  return `You are analyzing a series of wellbeing logs for the student: ${name}.

Chronological Journal History:
${entriesList}

Your tasks as a Root Cause Guided Intervention Engine:
1. Assess the current emotional state, burnout risk, and confidence trend.
2. Determine the primary root cause of the student's stress.
3. Compute the confidence impact, frequency observed, and typical trigger sequence flow.
4. Estimate the pattern confidence percentage and state the reason based on log frequency and timeframe.
5. Provide exactly 3 specific evidence lines summarizing why you identified this pattern.
6. Forecast the expected outcome if the pattern continues, and suggest the most effective intervention.
7. Outline outcome-oriented next steps (Immediate Action, Next 7 Days, Long-Term Adjustment).
8. Generate a final short, powerful, 1-2 sentence coach reflection.

Ensure your entire output strictly matches the requested JSON schema structure.`;
}

export async function handler(event: any) {
  // CORS Headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    
    // Validation checks
    if (!body.entries || !Array.isArray(body.entries) || body.entries.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing or invalid entries list in request body." }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === "") {
      console.error("GEMINI_API_KEY is not configured in Netlify environment variables.");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: "FreeMind is temporarily unavailable. Please try again in a few minutes.",
        }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = buildPrompt(body);
    const response = await model.generateContent(prompt);
    const text = response.response.text();

    if (!text) {
      throw new Error("Received an empty response from Gemini API.");
    }

    // Verify it is valid JSON
    const parsed = JSON.parse(text);

    // Basic structural checks for the Root Cause Engine schema
    if (
      !parsed.currentState ||
      typeof parsed.currentState.emotionalHealthScore !== "number" ||
      !["Low", "Moderate", "High"].includes(parsed.currentState.burnoutRisk) ||
      !["Stable", "Improving", "Declining"].includes(parsed.currentState.confidenceTrend) ||
      !parsed.rootCauseAnalysis ||
      typeof parsed.rootCauseAnalysis.primaryRootCause !== "string" ||
      !["Low", "Medium", "High"].includes(parsed.rootCauseAnalysis.confidenceImpact) ||
      typeof parsed.rootCauseAnalysis.observedIn !== "string" ||
      !Array.isArray(parsed.rootCauseAnalysis.typicalTriggerSequence) ||
      !parsed.rootCauseAnalysis.patternConfidence ||
      typeof parsed.rootCauseAnalysis.patternConfidence.percentage !== "number" ||
      typeof parsed.rootCauseAnalysis.patternConfidence.reason !== "string" ||
      !Array.isArray(parsed.evidence) ||
      !parsed.interventionForecast ||
      typeof parsed.interventionForecast.expectedOutcome !== "string" ||
      typeof parsed.interventionForecast.suggestedIntervention !== "string" ||
      !parsed.whatToDoNext ||
      typeof parsed.whatToDoNext.immediateAction !== "string" ||
      typeof parsed.whatToDoNext.next7Days !== "string" ||
      typeof parsed.whatToDoNext.longTermAdjustment !== "string" ||
      typeof parsed.coachReflection !== "string" ||
      typeof parsed.distressWarningDetected !== "boolean"
    ) {
      throw new Error("Gemini response JSON structure does not match the Root Cause Engine schema.");
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (error: any) {
    console.error("Error in Netlify Function handler:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "FreeMind is temporarily unavailable. Please try again in a few minutes.",
      }),
    };
  }
}
