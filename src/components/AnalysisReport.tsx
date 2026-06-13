import { useState } from "react";
import type { AnalysisResult } from "../utils/gemini";
import type { JournalInput } from "../utils/validation";
import { 
  AlertTriangle, 
  Smile, 
  TrendingUp, 
  Heart, 
  Calendar, 
  RefreshCw,
  Copy,
  Check,
  BookOpen
} from "lucide-react";

interface AnalysisReportProps {
  result: AnalysisResult;
  scanInput: JournalInput | null;
  onReset: () => void;
}

export function AnalysisReport({ result, scanInput, onReset }: AnalysisReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `FREEMIND WELLBEING REPORT
=========================================
EMOTIONAL SUMMARY:
${result.emotionalSummary}

DETECTED TRIGGERS:
${result.detectedTriggers.map((t) => `- ${t}`).join("\n")}

PATTERN ANALYSIS:
${result.patternAnalysis}

RISK ASSESSMENT:
Level: ${result.riskAssessment.level}
Reasoning: ${result.riskAssessment.reasoning}

COPING STRATEGIES:
${result.copingStrategies.map((s) => `- ${s}`).join("\n")}

MOTIVATION COACH:
${result.motivation}

ACTION ROADMAP:
- Today: ${result.actionPlan.today}
- This Week: ${result.actionPlan.thisWeek}
- Before Exam: ${result.actionPlan.beforeExam}
=========================================`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const getRiskBadgeColor = (level: "Low Risk" | "Moderate Risk" | "High Risk") => {
    switch (level) {
      case "Low Risk":
        return "risk-badge-low";
      case "Moderate Risk":
        return "risk-badge-medium";
      case "High Risk":
        return "risk-badge-high";
      default:
        return "";
    }
  };

  const getEmotionalStateIndicator = (level: "Low Risk" | "Moderate Risk" | "High Risk") => {
    switch (level) {
      case "Low Risk":
        return { text: "Calm & Focused", colorClass: "state-calm" };
      case "Moderate Risk":
        return { text: "Unsettled & Stressed", colorClass: "state-unsettled" };
      case "High Risk":
        return { text: "Highly Strained / Overloaded", colorClass: "state-strained" };
      default:
        return { text: "Stable", colorClass: "" };
    }
  };

  const emotionalState = getEmotionalStateIndicator(result.riskAssessment.level);

  return (
    <div className="analysis-report" role="region" aria-label="FreeMind Wellness Report">
      
      <div className="report-header">
        <div>
          <h2>Your Personal Wellbeing Report</h2>
          {scanInput && (
            <p className="report-meta">
              Prepared for {scanInput.name || "Anonymous Student"} • {scanInput.examType} Exam ({scanInput.daysRemaining} days left)
            </p>
          )}
        </div>
        <div className="report-actions">
          <button
            onClick={handleCopy}
            className="btn btn-secondary action-btn"
            aria-label={copied ? "Copied report text" : "Copy report text to clipboard"}
          >
            {copied ? (
              <>
                <Check className="btn-icon text-success" aria-hidden="true" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="btn-icon" aria-hidden="true" />
                <span>Copy Report</span>
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="btn btn-secondary action-btn"
            aria-label="Start a new analysis scan"
          >
            <RefreshCw className="btn-icon" aria-hidden="true" />
            <span>Scan Again</span>
          </button>
        </div>
      </div>

      {/* Distress warning banner if distressWarningDetected is true */}
      {result.distressWarningDetected && (
        <div className="distress-card" role="alert" aria-live="assertive">
          <div className="distress-title">
            <AlertTriangle className="distress-icon" aria-hidden="true" />
            <h3>Important Notice: Professional Support Available</h3>
          </div>
          <p className="distress-message">
            Our AI detected signs of extreme stress, burnout, or deep anxiety. Please remember that you do not have to carry this alone. You are valuable, and your mental health is far more important than any examination.
          </p>
          <div className="distress-actions">
            <p className="distress-prompt">
              We strongly encourage you to talk to a trusted family member, teacher, or friend. You can also connect with free, confidential professional helplines:
            </p>
            <ul className="helpline-list">
              <li>
                <strong>Tele-MANAS (Govt. of India):</strong> <a href="tel:14416">14416</a> or <a href="tel:18008914416">1800-891-4416</a> (24/7 Free Helpline)
              </li>
              <li>
                <strong>Kiran Mental Health Helpline (India):</strong> <a href="tel:18005990019">1800-599-0019</a> (24/7 Free Helpline)
              </li>
              <li>
                <strong>Vandrevala Foundation:</strong> <a href="tel:+919999666555">+91 9999 666 555</a> (24/7 Helpline)
              </li>
              <li>
                <strong>Sneha India:</strong> <a href="tel:+914424640050">+91-44-24640050</a> (24/7 Helpline)
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Wellness Score Visualization (Lightweight visual metrics bars) */}
      {scanInput && (
        <section className="wellness-scores-overview" aria-label="Wellbeing Scores Overview">
          <div className="overview-header">
            <h3>Daily Metrics Overview</h3>
            <p className="overview-sub">Visual representation of your self-scored metrics</p>
          </div>
          <div className="overview-grid">
            <div className="overview-metric-card mood">
              <div className="metric-info">
                <span className="metric-name">Mood State</span>
                <span className="metric-val">{scanInput.moodScore} / 10</span>
              </div>
              <div className="metric-bar-bg">
                <div className="metric-bar-fill" style={{ width: `${scanInput.moodScore * 10}%` }}></div>
              </div>
            </div>
            <div className="overview-metric-card energy">
              <div className="metric-info">
                <span className="metric-name">Energy & Stamina</span>
                <span className="metric-val">{scanInput.energyScore} / 10</span>
              </div>
              <div className="metric-bar-bg">
                <div className="metric-bar-fill" style={{ width: `${scanInput.energyScore * 10}%` }}></div>
              </div>
            </div>
            <div className="overview-metric-card stress">
              <div className="metric-info">
                <span className="metric-name">Preparation Stress</span>
                <span className="metric-val">{scanInput.stressScore} / 10</span>
              </div>
              <div className="metric-bar-bg">
                <div className="metric-bar-fill" style={{ width: `${scanInput.stressScore * 10}%` }}></div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="report-grid">
        {/* Card 1: Mental Snapshot */}
        <section className="report-card">
          <div className="card-header">
            <Smile className="card-icon" aria-hidden="true" />
            <h3>Mental Snapshot</h3>
          </div>
          <div className="card-body">
            <div className="emotional-state-container">
              <span className="state-label">Emotional Indicator:</span>
              <span className={`state-badge ${emotionalState.colorClass}`}>
                {emotionalState.text}
              </span>
            </div>
            <p className="text-content" style={{ marginTop: "8px" }}>{result.emotionalSummary}</p>
          </div>
        </section>

        {/* Card 2: Hidden Stress Triggers */}
        <section className="report-card">
          <div className="card-header">
            <AlertTriangle className="card-icon" aria-hidden="true" />
            <h3>Hidden Stress Triggers</h3>
          </div>
          <div className="card-body">
            <div className="risk-level-container">
              <span className="risk-label">Wellbeing Status:</span>
              <span className={`risk-badge ${getRiskBadgeColor(result.riskAssessment.level)}`}>
                {result.riskAssessment.level}
              </span>
            </div>
            <p className="risk-reasoning" style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
              {result.riskAssessment.reasoning}
            </p>
            {result.detectedTriggers.length > 0 ? (
              <ul className="triggers-list">
                {result.detectedTriggers.map((trigger, idx) => (
                  <li key={idx} className="trigger-item">
                    {trigger}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No hidden triggers detected in this journal entry.</p>
            )}
          </div>
        </section>

        {/* Card 3: Behavior Patterns */}
        <section className="report-card full-width">
          <div className="card-header">
            <TrendingUp className="card-icon" aria-hidden="true" />
            <h3>Behavior Patterns</h3>
          </div>
          <div className="card-body">
            <p className="text-content">{result.patternAnalysis}</p>
          </div>
        </section>

        {/* Card 4: Today's Support Plan */}
        <section className="report-card full-width">
          <div className="card-header">
            <Heart className="card-icon" aria-hidden="true" />
            <h3>Today's Support Plan</h3>
          </div>
          <div className="card-body">
            <ul className="coping-list">
              {result.copingStrategies.map((strategy, idx) => (
                <li key={idx} className="coping-item">
                  <span className="coping-number">{idx + 1}</span>
                  <p>{strategy}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Card 5: Motivation Coach */}
        <section className="report-card full-width motivation-card">
          <div className="card-header">
            <BookOpen className="card-icon" aria-hidden="true" />
            <h3>Motivation Coach</h3>
          </div>
          <div className="card-body">
            <blockquote className="motivation-quote">
              <p>"{result.motivation}"</p>
            </blockquote>
          </div>
        </section>

        {/* Card 6: Action Roadmap */}
        <section className="report-card full-width">
          <div className="card-header">
            <Calendar className="card-icon" aria-hidden="true" />
            <h3>Action Roadmap</h3>
          </div>
          <div className="card-body">
            <div className="action-plan-timeline">
              <div className="timeline-item">
                <div className="timeline-badge today">Today</div>
                <div className="timeline-content">
                  <h4>Immediate Micro-step</h4>
                  <p>{result.actionPlan.today}</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-badge week">This Week</div>
                <div className="timeline-content">
                  <h4>Weekly Improvement Goal</h4>
                  <p>{result.actionPlan.thisWeek}</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-badge exam">Before Exam</div>
                <div className="timeline-content">
                  <h4>Exam Day preparation Advice</h4>
                  <p>{result.actionPlan.beforeExam}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="report-footer-reset">
        <button
          onClick={onReset}
          className="btn btn-primary btn-large"
          aria-label="Start a new daily scanning session"
        >
          <RefreshCw className="btn-icon" aria-hidden="true" />
          <span>Scan Another Entry</span>
        </button>
      </div>
    </div>
  );
}
