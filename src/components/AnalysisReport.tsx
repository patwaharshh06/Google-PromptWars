import { useState } from "react";
import type { AnalysisResult } from "../utils/gemini";
import { 
  AlertTriangle, 
  Smile, 
  TrendingUp, 
  ShieldAlert, 
  Heart, 
  Calendar, 
  RefreshCw,
  Copy,
  Check
} from "lucide-react";

interface AnalysisReportProps {
  result: AnalysisResult;
  onReset: () => void;
}

export function AnalysisReport({ result, onReset }: AnalysisReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `EXAMMIND AI - WELLBEING ANALYSIS REPORT
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

MOTIVATION & ENCOURAGEMENT:
${result.motivation}

ACTION PLAN:
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

  return (
    <div className="analysis-report" role="region" aria-label="AI Analysis Report">
      <div className="report-header">
        <h2>Your Wellbeing Analysis Report</h2>
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

      <div className="report-grid">
        {/* Risk Assessment & Mood Status */}
        <section className="report-card status-card">
          <div className="card-header">
            <ShieldAlert className="card-icon" aria-hidden="true" />
            <h3>Risk Assessment</h3>
          </div>
          <div className="card-body">
            <div className="risk-level-container">
              <span className="risk-label">Classification:</span>
              <span className={`risk-badge ${getRiskBadgeColor(result.riskAssessment.level)}`}>
                {result.riskAssessment.level}
              </span>
            </div>
            <p className="risk-reasoning">{result.riskAssessment.reasoning}</p>
          </div>
        </section>

        {/* Emotional Summary */}
        <section className="report-card">
          <div className="card-header">
            <Smile className="card-icon" aria-hidden="true" />
            <h3>Emotional Summary</h3>
          </div>
          <div className="card-body">
            <p className="text-content">{result.emotionalSummary}</p>
          </div>
        </section>

        {/* Trigger Detection */}
        <section className="report-card">
          <div className="card-header">
            <AlertTriangle className="card-icon" aria-hidden="true" />
            <h3>Detected Triggers</h3>
          </div>
          <div className="card-body">
            {result.detectedTriggers.length > 0 ? (
              <ul className="triggers-list">
                {result.detectedTriggers.map((trigger, idx) => (
                  <li key={idx} className="trigger-item">
                    {trigger}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No specific triggers detected in the journal entry.</p>
            )}
          </div>
        </section>

        {/* Pattern Analysis */}
        <section className="report-card">
          <div className="card-header">
            <TrendingUp className="card-icon" aria-hidden="true" />
            <h3>Emotional Patterns</h3>
          </div>
          <div className="card-body">
            <p className="text-content">{result.patternAnalysis}</p>
          </div>
        </section>

        {/* Coping Strategies */}
        <section className="report-card full-width">
          <div className="card-header">
            <Heart className="card-icon" aria-hidden="true" />
            <h3>Personalized Coping Strategies</h3>
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

        {/* Motivation */}
        <section className="report-card full-width motivation-card">
          <div className="card-header">
            <Heart className="card-icon" aria-hidden="true" />
            <h3>Encouragement & Mindset</h3>
          </div>
          <div className="card-body">
            <blockquote className="motivation-quote">
              <p>"{result.motivation}"</p>
            </blockquote>
          </div>
        </section>

        {/* Action Plan */}
        <section className="report-card full-width">
          <div className="card-header">
            <Calendar className="card-icon" aria-hidden="true" />
            <h3>Mindful Action Plan</h3>
          </div>
          <div className="card-body">
            <div className="action-plan-timeline">
              <div className="timeline-item">
                <div className="timeline-badge today">Today</div>
                <div className="timeline-content">
                  <h4>One Small Step</h4>
                  <p>{result.actionPlan.today}</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-badge week">This Week</div>
                <div className="timeline-content">
                  <h4>Improvement Action</h4>
                  <p>{result.actionPlan.thisWeek}</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-badge exam">Before Exam</div>
                <div className="timeline-content">
                  <h4>Preparation Strategy</h4>
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
