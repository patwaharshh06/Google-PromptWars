import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import type { JournalInput, ValidationErrors } from "../utils/validation";
import { validateInput } from "../utils/validation";
import { Brain, Activity, Battery, AlertTriangle, Sparkles } from "lucide-react";

interface JournalFormProps {
  onSubmit: (data: JournalInput) => void;
  isLoading: boolean;
}

const EXAM_OPTIONS = ["JEE", "NEET", "UPSC", "CAT", "CUET", "GATE", "Other"];

export function JournalForm({ onSubmit, isLoading }: JournalFormProps) {
  const [formData, setFormData] = useState<Partial<JournalInput>>({
    name: "",
    examType: "JEE",
    daysRemaining: undefined,
    moodScore: undefined,
    energyScore: undefined,
    stressScore: undefined,
    journalEntry: "",
  });

  const [customExam, setCustomExam] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleScoreChange = (field: "moodScore" | "energyScore" | "stressScore", value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let finalValue: string | number | undefined = value;
    
    if (name === "daysRemaining") {
      finalValue = value === "" ? undefined : parseInt(value, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = () => {
    // No-op to support existing handlers without unused warnings
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Prepare final input structure
    const finalExamType = formData.examType === "Other" ? customExam.trim() : formData.examType;
    const submissionData: Partial<JournalInput> = {
      ...formData,
      examType: finalExamType,
    };

    const validation = validateInput(submissionData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      
      // Accessibility focus helper - find first error element and focus it
      const firstErrorField = Object.keys(validation.errors)[0];
      const elementToFocus = (firstErrorField === "moodScore" || firstErrorField === "energyScore" || firstErrorField === "stressScore")
        ? document.getElementById(`${firstErrorField}-group`)
        : (document.getElementsByName(firstErrorField)[0] as HTMLElement | undefined) || null;
      
      if (elementToFocus) {
        elementToFocus.scrollIntoView({ behavior: "smooth", block: "center" });
        elementToFocus.focus();
      }
      
      return;
    }

    // Submit validated data
    onSubmit(submissionData as JournalInput);
  };

  const renderScoreRadioGroup = (
    field: "moodScore" | "energyScore" | "stressScore",
    label: string,
    description: string,
    icon: ReactNode,
    lowLabel: string,
    highLabel: string
  ) => {
    const currentValue = formData[field];
    const fieldError = errors[field];

    return (
      <div 
        className={`form-group score-form-group ${fieldError ? "has-error" : ""}`} 
        id={`${field}-group`}
        tabIndex={-1}
        role="radiogroup"
        aria-labelledby={`${field}-label`}
        aria-describedby={`${field}-desc ${fieldError ? `${field}-error` : ""}`}
      >
        <div className="score-group-header">
          <div className="score-group-title">
            {icon}
            <span id={`${field}-label`} className="score-label-text">{label}</span>
          </div>
          <span className="score-desc" id={`${field}-desc`}>{description}</span>
        </div>

        <div className="score-range-indicators">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>

        <div className="score-options">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => {
            const id = `${field}-${val}`;
            const isChecked = currentValue === val;
            return (
              <label 
                key={val} 
                htmlFor={id} 
                className={`score-option-label ${isChecked ? "active" : ""}`}
              >
                <input
                  type="radio"
                  id={id}
                  name={field}
                  value={val}
                  checked={isChecked}
                  onChange={() => handleScoreChange(field, val)}
                  onBlur={handleBlur}
                  className="sr-only"
                  aria-label={`${label} score of ${val}`}
                />
                <span className="score-number">{val}</span>
              </label>
            );
          })}
        </div>

        {fieldError && (
          <span className="error-message" id={`${field}-error`} role="alert">
            <AlertTriangle className="error-icon" aria-hidden="true" />
            {fieldError}
          </span>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="journal-form" noValidate>
      <h2>Start Your Daily Wellbeing Scan</h2>
      <p className="form-sub">
        Fill in your exam details, score your metrics, and write a quick journal entry. Our AI will analyze your stress triggers and give you an action plan.
      </p>

      <div className="form-row">
        <div className={`form-group ${errors.name ? "has-error" : ""}`}>
          <label htmlFor="student-name">Name <span className="optional">(Optional)</span></label>
          <input
            id="student-name"
            name="name"
            type="text"
            value={formData.name || ""}
            onChange={handleInputChange}
            placeholder="e.g. Rahul"
            className="form-control"
            maxLength={50}
          />
          {errors.name && (
            <span className="error-message" role="alert">
              <AlertTriangle className="error-icon" aria-hidden="true" />
              {errors.name}
            </span>
          )}
        </div>

        <div className={`form-group ${errors.examType ? "has-error" : ""}`}>
          <label htmlFor="exam-type">Competitive Exam *</label>
          <select
            id="exam-type"
            name="examType"
            value={formData.examType}
            onChange={handleInputChange}
            className="form-control"
            required
          >
            {EXAM_OPTIONS.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>
          {errors.examType && (
            <span className="error-message" role="alert">
              <AlertTriangle className="error-icon" aria-hidden="true" />
              {errors.examType}
            </span>
          )}
        </div>
      </div>

      {formData.examType === "Other" && (
        <div className="form-group slide-down">
          <label htmlFor="custom-exam">Specify Exam Name *</label>
          <input
            id="custom-exam"
            type="text"
            value={customExam}
            onChange={(e) => setCustomExam(e.target.value)}
            placeholder="Enter the name of your exam"
            className="form-control"
            required
          />
        </div>
      )}

      <div className={`form-group ${errors.daysRemaining ? "has-error" : ""}`}>
        <label htmlFor="days-remaining">Days Remaining Until Exam *</label>
        <input
          id="days-remaining"
          name="daysRemaining"
          type="number"
          min="0"
          value={formData.daysRemaining === undefined ? "" : formData.daysRemaining}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="e.g. 45"
          className="form-control"
          required
        />
        {errors.daysRemaining && (
          <span className="error-message" role="alert">
            <AlertTriangle className="error-icon" aria-hidden="true" />
            {errors.daysRemaining}
          </span>
        )}
      </div>

      <hr className="form-divider" aria-hidden="true" />

      {renderScoreRadioGroup(
        "moodScore",
        "Mood Score",
        "How would you rate your emotional state today?",
        <Brain className="score-icon mood" aria-hidden="true" />,
        "1 - Overwhelmed / Low",
        "10 - Calm / Positive"
      )}

      {renderScoreRadioGroup(
        "energyScore",
        "Energy Score",
        "How is your physical and mental stamina?",
        <Battery className="score-icon energy" aria-hidden="true" />,
        "1 - Burnout / Exhausted",
        "10 - High Stamina / Active"
      )}

      {renderScoreRadioGroup(
        "stressScore",
        "Stress Level",
        "How intense is the preparation pressure today?",
        <Activity className="score-icon stress" aria-hidden="true" />,
        "1 - Light / Relaxed",
        "10 - Extremely Strained"
      )}

      <hr className="form-divider" aria-hidden="true" />

      <div className={`form-group ${errors.journalEntry ? "has-error" : ""}`}>
        <div className="journal-header">
          <label htmlFor="journal-entry">Daily Journal Entry *</label>
          <span className="char-count">
            {formData.journalEntry?.length || 0} / 2000 characters
          </span>
        </div>
        <textarea
          id="journal-entry"
          name="journalEntry"
          rows={5}
          value={formData.journalEntry}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Share your raw thoughts. What did you study? What is bothering you? (e.g. 'I studied 8 hours today but still feel behind. My mock test score dropped and I keep comparing myself with friends. I'm worried I won't clear JEE.')"
          className="form-control textarea-control"
          required
        ></textarea>
        {errors.journalEntry && (
          <span className="error-message" role="alert">
            <AlertTriangle className="error-icon" aria-hidden="true" />
            {errors.journalEntry}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={`btn btn-primary submit-btn ${isLoading ? "loading" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner" aria-hidden="true"></span>
            <span>Analyzing Your Wellbeing...</span>
          </>
        ) : (
          <>
            <Sparkles className="submit-icon" aria-hidden="true" />
            <span>Analyze My Wellbeing</span>
          </>
        )}
      </button>
    </form>
  );
}
