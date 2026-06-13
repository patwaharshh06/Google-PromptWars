export interface JournalInput {
  name?: string;
  examType: string;
  daysRemaining: number;
  moodScore: number;
  energyScore: number;
  stressScore: number;
  journalEntry: string;
}

export interface ValidationErrors {
  name?: string;
  examType?: string;
  daysRemaining?: string;
  moodScore?: string;
  energyScore?: string;
  stressScore?: string;
  journalEntry?: string;
}

export function validateInput(input: Partial<JournalInput>): { isValid: boolean; errors: ValidationErrors } {
  const errors: ValidationErrors = {};
  let isValid = true;

  // Name is optional, but if provided, validate length
  if (input.name && input.name.trim().length > 50) {
    errors.name = "Name must be under 50 characters.";
    isValid = false;
  }

  // Exam Type: must be selected from a valid set or not empty
  const validExams = ["JEE", "NEET", "UPSC", "CAT", "CUET", "GATE", "Other"];
  if (!input.examType) {
    errors.examType = "Please select or specify your exam type.";
    isValid = false;
  } else if (!validExams.includes(input.examType) && input.examType.trim().length === 0) {
    errors.examType = "Invalid exam type.";
    isValid = false;
  }

  // Days Remaining: must be a number >= 0
  if (input.daysRemaining === undefined || input.daysRemaining === null || isNaN(input.daysRemaining)) {
    errors.daysRemaining = "Days remaining until exam is required.";
    isValid = false;
  } else if (input.daysRemaining < 0) {
    errors.daysRemaining = "Days remaining cannot be negative.";
    isValid = false;
  } else if (!Number.isInteger(input.daysRemaining)) {
    errors.daysRemaining = "Days remaining must be a whole number.";
    isValid = false;
  }

  // Mood Score: 1-10
  if (input.moodScore === undefined || input.moodScore === null || isNaN(input.moodScore)) {
    errors.moodScore = "Mood score is required.";
    isValid = false;
  } else if (input.moodScore < 1 || input.moodScore > 10 || !Number.isInteger(input.moodScore)) {
    errors.moodScore = "Mood score must be an integer between 1 and 10.";
    isValid = false;
  }

  // Energy Score: 1-10
  if (input.energyScore === undefined || input.energyScore === null || isNaN(input.energyScore)) {
    errors.energyScore = "Energy score is required.";
    isValid = false;
  } else if (input.energyScore < 1 || input.energyScore > 10 || !Number.isInteger(input.energyScore)) {
    errors.energyScore = "Energy score must be an integer between 1 and 10.";
    isValid = false;
  }

  // Stress Score: 1-10
  if (input.stressScore === undefined || input.stressScore === null || isNaN(input.stressScore)) {
    errors.stressScore = "Stress level is required.";
    isValid = false;
  } else if (input.stressScore < 1 || input.stressScore > 10 || !Number.isInteger(input.stressScore)) {
    errors.stressScore = "Stress level must be an integer between 1 and 10.";
    isValid = false;
  }

  // Journal Entry: 10 to 2000 characters
  if (!input.journalEntry || input.journalEntry.trim().length === 0) {
    errors.journalEntry = "Please write a journal entry to describe your feelings.";
    isValid = false;
  } else if (input.journalEntry.trim().length < 10) {
    errors.journalEntry = "Please write a longer entry (at least 10 characters) to help the AI analyze properly.";
    isValid = false;
  } else if (input.journalEntry.length > 2000) {
    errors.journalEntry = "Journal entry must be under 2000 characters.";
    isValid = false;
  }

  return { isValid, errors };
}
