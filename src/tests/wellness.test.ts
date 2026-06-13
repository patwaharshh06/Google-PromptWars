import { describe, it, expect } from "vitest";
import { validateInput } from "../utils/validation";
import type { JournalInput } from "../utils/validation";
import { buildPrompt } from "../utils/gemini";
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
    it("should format the prompt correctly with all inputs", () => {
      const input: JournalInput = {
        name: "Aman",
        examType: "GATE",
        daysRemaining: 15,
        moodScore: 5,
        energyScore: 4,
        stressScore: 8,
        journalEntry: "Struggling with maths syllabus revision."
      };

      const prompt = buildPrompt(input);
      expect(prompt).toContain("Student Name: Aman");
      expect(prompt).toContain("Exam Preparing For: GATE");
      expect(prompt).toContain("Days Remaining Until Exam: 15 days");
      expect(prompt).toContain("Mood Score (1-10): 5");
      expect(prompt).toContain("Energy Score (1-10): 4");
      expect(prompt).toContain("Stress Level (1-10): 8");
      expect(prompt).toContain("Struggling with maths syllabus revision.");
      expect(prompt).toContain("JSON format");
    });
  });

  describe("Risk Classification and Response Parsing", () => {
    // Utility function to test parsing behaviour
    const simulateParse = (jsonString: string): AnalysisResult => {
      const parsed = JSON.parse(jsonString);
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
      return parsed as AnalysisResult;
    };

    it("should successfully parse valid JSON matching structure", () => {
      const validJson = JSON.stringify({
        emotionalSummary: "Experiencing stress and performance pressure.",
        detectedTriggers: ["mock test score", "revision load"],
        patternAnalysis: "Peers comparison loop.",
        riskAssessment: {
          level: "Moderate Risk",
          reasoning: "High stress score (8/10) and performance anxiety."
        },
        copingStrategies: ["Mindful breathing", "Process goal planning"],
        motivation: "You are doing great, take it one step at a time.",
        actionPlan: {
          today: "Review only one topic.",
          thisWeek: "Setup a sleep schedule.",
          beforeExam: "Take mock tests in simulated exam conditions."
        },
        distressWarningDetected: false
      });

      const parsed = simulateParse(validJson);
      expect(parsed.riskAssessment.level).toBe("Moderate Risk");
      expect(parsed.distressWarningDetected).toBe(false);
      expect(parsed.detectedTriggers).toContain("mock test score");
    });

    it("should throw error for incomplete JSON structures", () => {
      const invalidJson = JSON.stringify({
        emotionalSummary: "Experiencing stress.",
        // missing detectedTriggers, riskAssessment, etc.
        motivation: "Keep going."
      });

      expect(() => simulateParse(invalidJson)).toThrow();
    });

    it("should throw error for invalid risk assessment levels", () => {
      const invalidJson = JSON.stringify({
        emotionalSummary: "Feeling okay.",
        detectedTriggers: [],
        patternAnalysis: "None",
        riskAssessment: {
          level: "Critical Risk", // Invalid level
          reasoning: "None"
        },
        copingStrategies: [],
        motivation: "Keep going.",
        actionPlan: {
          today: "None",
          thisWeek: "None",
          beforeExam: "None"
        },
        distressWarningDetected: false
      });

      expect(() => simulateParse(invalidJson)).toThrow();
    });
  });
});
