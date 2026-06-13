import { describe, it, expect } from "vitest";
import { validateInput } from "../utils/validation";
import type { JournalInput } from "../utils/validation";
import { buildPrompt } from "../../netlify/functions/analyze";
import type { AnalysisResult } from "../utils/gemini";

describe("EXAMMIND AI - Mental Wellness Tracker Tests", () => {
  
  describe("Input Validation", () => {
    it("should pass for a fully valid input", () => {
      const valid: JournalInput = {
        name: "Rahul",
        examType: "JEE",
        daysRemaining: 45,
        moodScore: 6,
        energyScore: 7,
        stressScore: 5,
        journalEntry: "I studied 8 hours today but still feel behind. My mock test score dropped."
      };
      const result = validateInput(valid);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    it("should pass if name is omitted (as name is optional)", () => {
      const valid: JournalInput = {
        examType: "NEET",
        daysRemaining: 10,
        moodScore: 4,
        energyScore: 5,
        stressScore: 8,
        journalEntry: "Very stressed about the upcoming mock tests."
      };
      const result = validateInput(valid);
      expect(result.isValid).toBe(true);
    });

    it("should fail for invalid scores outside 1-10 range", () => {
      const invalid: JournalInput = {
        examType: "UPSC",
        daysRemaining: 120,
        moodScore: 0, // invalid
        energyScore: 11, // invalid
        stressScore: 5,
        journalEntry: "Preparation is going okay, just tired."
      };
      const result = validateInput(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.moodScore).toBeDefined();
      expect(result.errors.energyScore).toBeDefined();
    });

    it("should fail for negative days remaining", () => {
      const invalid: JournalInput = {
        examType: "GATE",
        daysRemaining: -5, // invalid
        moodScore: 5,
        energyScore: 5,
        stressScore: 5,
        journalEntry: "Exam was yesterday, feeling weird."
      };
      const result = validateInput(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.daysRemaining).toBeDefined();
    });

    it("should fail for very short journal entry", () => {
      const invalid: JournalInput = {
        examType: "CAT",
        daysRemaining: 30,
        moodScore: 7,
        energyScore: 7,
        stressScore: 7,
        journalEntry: "Tired" // too short
      };
      const result = validateInput(invalid);
      expect(result.isValid).toBe(false);
      expect(result.errors.journalEntry).toBeDefined();
    });
  });

  describe("Prompt Generation", () => {
    it("should format the prompt correctly with multiple entries", () => {
      const input = {
        name: "Aman",
        entries: [
          {
            id: "1",
            date: "2026-06-13",
            examType: "GATE",
            daysRemaining: 15,
            moodScore: 5,
            energyScore: 4,
            stressScore: 8,
            journalEntry: "Struggling with maths syllabus revision."
          }
        ]
      };

      const prompt = buildPrompt(input);
      expect(prompt).toContain("Aman");
      expect(prompt).toContain("GATE");
      expect(prompt).toContain("15 days");
      expect(prompt).toContain("Mood Score (1-10): 5");
      expect(prompt).toContain("Energy Score (1-10): 4");
      expect(prompt).toContain("Stress Score (1-10): 8");
      expect(prompt).toContain("Struggling with maths syllabus revision.");
    });
  });

  describe("Risk Classification and Response Parsing", () => {
    // Utility function to test parsing behaviour
    const simulateParse = (jsonString: string): AnalysisResult => {
      const parsed = JSON.parse(jsonString);
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
        throw new Error("API response JSON structure is invalid or incomplete.");
      }
      return parsed as AnalysisResult;
    };

    it("should successfully parse valid JSON matching structure", () => {
      const validJson = JSON.stringify({
        currentState: {
          emotionalHealthScore: 6,
          burnoutRisk: "Moderate",
          confidenceTrend: "Declining"
        },
        rootCauseAnalysis: {
          primaryRootCause: "Peer Comparison",
          confidenceImpact: "High",
          observedIn: "5 of 7 entries",
          typicalTriggerSequence: [
            "Mock Test Result",
            "Comparison With Friends",
            "Confidence Drop"
          ],
          patternConfidence: {
            percentage: 87,
            reason: "Pattern observed across 6 entries."
          }
        },
        evidence: [
          "Trigger mapping shows mock test pressure accounts for 45% of stress",
          "Comparison with friends mentioned in 4 separate entries"
        ],
        interventionForecast: {
          expectedOutcome: "Increased burnout risk.",
          suggestedIntervention: "Reduce peer comparison."
        },
        whatToDoNext: {
          immediateAction: "Take deep breath",
          next7Days: "Review goals",
          longTermAdjustment: "Personal benchmark"
        },
        coachReflection: "Insightful reflection",
        distressWarningDetected: false
      });

      const parsed = simulateParse(validJson);
      expect(parsed.currentState.burnoutRisk).toBe("Moderate");
      expect(parsed.distressWarningDetected).toBe(false);
      expect(parsed.rootCauseAnalysis.primaryRootCause).toBe("Peer Comparison");
      expect(parsed.rootCauseAnalysis.patternConfidence.percentage).toBe(87);
    });

    it("should throw error for incomplete JSON structures", () => {
      const invalidJson = JSON.stringify({
        currentState: {
          emotionalHealthScore: 6
          // missing burnoutRisk, confidenceTrend
        },
        coachReflection: "Keep going."
      });

      expect(() => simulateParse(invalidJson)).toThrow();
    });

    it("should throw error for invalid risk assessment levels", () => {
      const invalidJson = JSON.stringify({
        currentState: {
          emotionalHealthScore: 7,
          burnoutRisk: "Critical", // Invalid level
          confidenceTrend: "Stable"
        },
        rootCauseAnalysis: {
          primaryRootCause: "None",
          confidenceImpact: "High",
          observedIn: "1 entry",
          typicalTriggerSequence: [],
          patternConfidence: {
            percentage: 50,
            reason: "None"
          }
        },
        evidence: [],
        interventionForecast: {
          expectedOutcome: "None",
          suggestedIntervention: "None"
        },
        whatToDoNext: {
          immediateAction: "None",
          next7Days: "None",
          longTermAdjustment: "None"
        },
        coachReflection: "Keep going.",
        distressWarningDetected: false
      });

      expect(() => simulateParse(invalidJson)).toThrow();
    });
  });
});
