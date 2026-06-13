import { useState } from "react";
import type { AnalysisResult } from "../utils/gemini";
import { 
  AlertTriangle, 
  RefreshCw,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Info
} from "lucide-react";

interface AnalysisReportProps {
  result: AnalysisResult;
  entriesCount: number;
  onReset: () => void;
}

export function AnalysisReport({ result, entriesCount, onReset }: AnalysisReportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = `FREEMIND AI PATTERN INTELLIGENCE REPORT
=========================================
ANALYZED LOGS: ${entriesCount} entries

1. YOUR CURRENT STATE
- Emotional Health Score: ${result.currentState.emotionalHealthScore}/10
- Burnout Risk: ${result.currentState.burnoutRisk}
- Confidence Trend: ${result.currentState.confidenceTrend}

2. ROOT CAUSE ANALYSIS
- Primary Root Cause: ${result.rootCauseAnalysis.primaryRootCause}
- Confidence Impact: ${result.rootCauseAnalysis.confidenceImpact}
- Observed In: ${result.rootCauseAnalysis.observedIn}
- Pattern Confidence: ${result.rootCauseAnalysis.patternConfidence.percentage}% (${result.rootCauseAnalysis.patternConfidence.reason})
- Typical Trigger Sequence: ${result.rootCauseAnalysis.typicalTriggerSequence.join(" -> ")}

3. WHY FREEMIND BELIEVES THIS (EVIDENCE)
${result.evidence.map((e) => `- ${e}`).join("\n")}

4. INTERVENTION FORECAST & ACTION
- Expected Outcome: ${result.interventionForecast.expectedOutcome}
- Suggested Intervention: ${result.interventionForecast.suggestedIntervention}
- Immediate Action: ${result.whatToDoNext.immediateAction}
- Next 7 Days: ${result.whatToDoNext.next7Days}
- Long-Term Adjustment: ${result.whatToDoNext.longTermAdjustment}

5. COACH REFLECTION
"${result.coachReflection}"
=========================================`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy report text:", err);
    }
  };

  const getBurnoutBadgeColor = (level: "Low" | "Moderate" | "High") => {
    switch (level) {
      case "Low":
        return "risk-badge-low";
      case "Moderate":
        return "risk-badge-medium";
      case "High":
        return "risk-badge-high";
      default:
        return "";
    }
  };

  const getTrendBadgeColor = (trend: "Stable" | "Improving" | "Declining") => {
    switch (trend) {
      case "Improving":
        return "trend-badge-improving";
      case "Stable":
        return "trend-badge-stable";
      case "Declining":
        return "trend-badge-declining";
      default:
        return "";
    }
  };

  return (
    <div className="analysis-report" role="region" aria-label="FreeMind AI Guided Intervention Center">
      
      <div className="report-header">
        <div>
          <span className="pattern-badge-sparkle">
            <Sparkles size={12} className="spark-icon" />
            <span>AI Guided Intervention Center</span>
          </span>
          <h2>Your Emotional Pattern Intelligence</h2>
          <p className="report-meta">
            Analyzing cycles across {entriesCount} logged wellbeing entries
          </p>
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
                <span>Copy Summary</span>
              </>
            )}
          </button>
          <button
            onClick={onReset}
            className="btn btn-secondary action-btn"
            aria-label="Clear analysis result"
          >
            <RefreshCw className="btn-icon" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Distress warning banner if distressWarningDetected is true */}
      {result.distressWarningDetected && (
        <div className="distress-card" role="alert" aria-live="assertive">
          <div className="distress-title">
            <AlertTriangle className="distress-icon" aria-hidden="true" />
            <h3>Important Notice: Support Resources Available</h3>
          </div>
          <p className="distress-message">
            Our AI analysis detected signs of extreme stress, burnout, or exam-related distress. Please know that your health is always the highest priority. You do not have to carry this pressure alone.
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

      {/* SECTION 1: Your Current State */}
      <section className="current-state-section">
        <h3 className="section-title-label">Your Current State</h3>
        <div className="current-state-grid">
          <div className="state-card-compact">
            <span className="state-card-title">Emotional Health</span>
            <div className="state-card-value-container">
              <span className="state-card-number">{result.currentState.emotionalHealthScore}</span>
              <span className="state-card-max">/10</span>
            </div>
            <span className="state-card-sub">Recent emotional health score</span>
          </div>

          <div className="state-card-compact">
            <span className="state-card-title">Burnout Risk</span>
            <div className="state-card-value-container">
              <span className={`state-card-badge ${getBurnoutBadgeColor(result.currentState.burnoutRisk)}`}>
                {result.currentState.burnoutRisk}
              </span>
            </div>
            <span className="state-card-sub">Based on energy & stress indicators</span>
          </div>

          <div className="state-card-compact">
            <span className="state-card-title">Confidence Trend</span>
            <div className="state-card-value-container">
              <span className={`state-card-badge ${getTrendBadgeColor(result.currentState.confidenceTrend)}`}>
                {result.currentState.confidenceTrend}
              </span>
            </div>
            <span className="state-card-sub">Direction of academic confidence</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Most Important Discovery - Root Cause Analysis (Hero Card) */}
      <section className="root-cause-hero-section">
        <h3 className="section-title-label">Most Important Discovery</h3>
        <div className="root-cause-hero-card">
          <div className="hero-card-header">
            <div className="root-cause-badge">Primary Root Cause</div>
            <h4 className="root-cause-title">{result.rootCauseAnalysis.primaryRootCause}</h4>
            <p className="root-cause-meta-desc">
              Your biggest source of stress is not exam difficulty. FreeMind found this pattern repeating across your journal history.
            </p>
          </div>

          <div className="root-cause-stats-grid">
            <div className="root-cause-stat">
              <span className="stat-label">Confidence Impact</span>
              <span className={`stat-value-badge impact-${result.rootCauseAnalysis.confidenceImpact.toLowerCase()}`}>
                {result.rootCauseAnalysis.confidenceImpact} Impact
              </span>
            </div>
            <div className="root-cause-stat">
              <span className="stat-label">Observed In</span>
              <span className="stat-value-text">{result.rootCauseAnalysis.observedIn}</span>
            </div>
          </div>

          {/* Typical Trigger Sequence */}
          {result.rootCauseAnalysis.typicalTriggerSequence && result.rootCauseAnalysis.typicalTriggerSequence.length > 0 && (
            <div className="trigger-sequence-flow">
              <span className="sequence-label">Typical Trigger Sequence Flow</span>
              <div className="sequence-steps-container">
                {result.rootCauseAnalysis.typicalTriggerSequence.map((step, idx) => (
                  <div key={idx} className="sequence-step-wrapper">
                    <div className="sequence-step">
                      <span className="step-num">{idx + 1}</span>
                      <span className="step-text">{step}</span>
                    </div>
                    {idx < result.rootCauseAnalysis.typicalTriggerSequence.length - 1 && (
                      <ArrowRight size={14} className="sequence-arrow" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pattern Confidence */}
          <div className="pattern-confidence-bar-container">
            <div className="confidence-label-row">
              <span className="confidence-label">FreeMind Confidence</span>
              <span className="confidence-percentage">{result.rootCauseAnalysis.patternConfidence.percentage}%</span>
            </div>
            <div className="confidence-progress-bg">
              <div 
                className="confidence-progress-fill" 
                style={{ width: `${result.rootCauseAnalysis.patternConfidence.percentage}%` }}
              ></div>
            </div>
            <p className="confidence-reason">{result.rootCauseAnalysis.patternConfidence.reason}</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Why FreeMind Believes This (Evidence) */}
      <section className="evidence-section">
        <h3 className="section-title-label">Why FreeMind Believes This</h3>
        <div className="evidence-card">
          <ul className="evidence-list-new">
            {result.evidence.map((point, index) => (
              <li key={index} className="evidence-item-new">
                <Info size={16} className="evidence-icon-bullet" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* SECTION 4: What To Do Next (Intervention Forecast & Action Plan) */}
      <section className="intervention-section">
        <h3 className="section-title-label">Guided Intervention & Action Plan</h3>
        
        <div className="forecast-box">
          <div className="forecast-header">
            <ShieldAlert size={18} className="forecast-icon" />
            <h4>If this pattern continues (Forecast)</h4>
          </div>
          <p className="forecast-expected">{result.interventionForecast.expectedOutcome}</p>
          <div className="forecast-suggested-box">
            <span className="suggested-tag">Suggested Intervention</span>
            <p className="suggested-intervention-text">{result.interventionForecast.suggestedIntervention}</p>
          </div>
        </div>

        <div className="action-plan-timeline-new">
          <div className="action-timeline-item">
            <div className="action-timeline-badge immediate">Immediate Action</div>
            <div className="action-timeline-content">
              <p>{result.whatToDoNext.immediateAction}</p>
            </div>
          </div>
          <div className="action-timeline-item">
            <div className="action-timeline-badge week">Next 7 Days</div>
            <div className="action-timeline-content">
              <p>{result.whatToDoNext.next7Days}</p>
            </div>
          </div>
          <div className="action-timeline-item">
            <div className="action-timeline-badge long-term">Long-Term Adjustment</div>
            <div className="action-timeline-content">
              <p>{result.whatToDoNext.longTermAdjustment}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Coach Reflection */}
      <section className="coach-reflection-section">
        <div className="coach-reflection-card">
          <div className="coach-avatar">
            <Sparkles size={18} className="coach-avatar-icon" />
          </div>
          <blockquote className="coach-blockquote">
            <p>"{result.coachReflection}"</p>
            <cite className="coach-cite">— FreeMind AI Coach</cite>
          </blockquote>
        </div>
      </section>

      <div className="report-footer-reset">
        <button
          onClick={onReset}
          className="btn btn-primary btn-large"
          aria-label="Reset Pattern intelligence report"
        >
          <RefreshCw className="btn-icon" aria-hidden="true" />
          <span>Reset Pattern Analysis</span>
        </button>
      </div>
    </div>
  );
}
