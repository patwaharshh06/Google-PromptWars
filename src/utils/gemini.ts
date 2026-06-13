import type { PatternAnalysisRequest } from "./validation";

export interface CurrentState {
  emotionalHealthScore: number;
  burnoutRisk: "Low" | "Moderate" | "High";
  confidenceTrend: "Stable" | "Improving" | "Declining";
}

export interface PatternConfidence {
  percentage: number;
  reason: string;
}

export interface RootCauseAnalysis {
  primaryRootCause: string;
  confidenceImpact: "Low" | "Medium" | "High";
  observedIn: string;
  typicalTriggerSequence: string[];
  patternConfidence: PatternConfidence;
}

export interface InterventionForecast {
  expectedOutcome: string;
  suggestedIntervention: string;
}

export interface WhatToDoNext {
  immediateAction: string;
  next7Days: string;
  longTermAdjustment: string;
}

export interface AnalysisResult {
  currentState: CurrentState;
  rootCauseAnalysis: RootCauseAnalysis;
  evidence: string[];
  interventionForecast: InterventionForecast;
  whatToDoNext: WhatToDoNext;
  coachReflection: string;
  distressWarningDetected: boolean;
}

export async function analyzeWellbeing(input: PatternAnalysisRequest): Promise<AnalysisResult> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let errorMessage = "FreeMind is temporarily unavailable. Please try again in a few minutes.";
    try {
      const errJson = await response.json();
      if (errJson && errJson.error) {
        errorMessage = errJson.error;
      }
    } catch {
      // Ignored: fallback to generic message
    }
    throw new Error(errorMessage);
  }

  try {
    const data: AnalysisResult = await response.json();
    return data;
  } catch (parseError) {
    throw new Error("FreeMind is temporarily unavailable. Please try again in a few minutes.", { cause: parseError });
  }
}
