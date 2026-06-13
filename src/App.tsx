import { useState } from "react";
import { Header } from "./components/Header";
import { JournalForm } from "./components/JournalForm";
import { AnalysisReport } from "./components/AnalysisReport";
import type { HistoryJournalEntry, JournalInput } from "./utils/validation";
import { analyzeWellbeing } from "./utils/gemini";
import type { AnalysisResult } from "./utils/gemini";
import { AlertCircle, Sparkles, Trash2 } from "lucide-react";

export function App() {
  const [entries, setEntries] = useState<HistoryJournalEntry[]>(() => {
    try {
      const stored = localStorage.getItem("freemind_journal_history");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load journal history from local storage:", e);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Save history helper
  const saveHistory = (newEntries: HistoryJournalEntry[]) => {
    setEntries(newEntries);
    try {
      localStorage.setItem("freemind_journal_history", JSON.stringify(newEntries));
    } catch (e) {
      console.error("Failed to save journal history to local storage:", e);
    }
  };

  const handleAddEntry = (data: JournalInput) => {
    const newEntry: HistoryJournalEntry = {
      ...data,
      id: Math.random().toString(36).substring(2, 11),
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    const updated = [newEntry, ...entries];
    saveHistory(updated);
    
    // Show quick feedback toast
    setStatusMessage("Entry saved to history. Analyze patterns below when ready!");
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all logged wellbeing entries? This action cannot be undone.")) {
      saveHistory([]);
      setResult(null);
      setError(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (entries.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      // Send all entries for pattern intelligence analysis
      const analysis = await analyzeWellbeing({ entries });
      setResult(analysis);
      
      // Scroll to report top
      setTimeout(() => {
        const reportElement = document.querySelector(".analysis-report");
        if (reportElement) {
          reportElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Pattern analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      <Header />
      
      <main role="main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2 className="hero-headline">FreeMind AI</h2>
            <p className="hero-subheadline">Your AI Mental Wellness Copilot</p>
            <p className="hero-description">
              Understand your emotional patterns before they become burnout.
            </p>
            <div className="hero-ctas">
              <button
                onClick={handleRunAnalysis}
                className={`btn btn-primary hero-cta-btn ${isLoading ? "loading" : ""}`}
                disabled={isLoading || entries.length === 0}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" aria-hidden="true"></span>
                    <span>Analyzing Journey...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="submit-icon" aria-hidden="true" />
                    <span>Analyze My Journey</span>
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("previous-entries-timeline");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className="btn btn-secondary hero-cta-btn"
              >
                View Previous Entries
              </button>
            </div>
            <div className="hero-usp-badge">
              <span className="usp-prefix">FreeMind USP:</span>
              <span className="usp-text">Most wellness apps tell you how you feel. FreeMind tells you WHY you keep feeling that way.</span>
            </div>
          </div>
        </section>

        {/* API Error Banner */}
        {error && (
          <div className="alert-banner error" role="alert" aria-live="polite">
            <AlertCircle className="alert-banner-icon" aria-hidden="true" />
            <div className="alert-banner-content">
              <p><strong>Analysis Error:</strong> {error}</p>
              <button onClick={() => setError(null)} className="retry-dismiss-btn">
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Saved Status Notification */}
        {statusMessage && (
          <div className="status-notification-toast" role="status">
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Dashboard Grid layout */}
        <div className="dashboard-grid">
          {/* Left Side: Logging Workspace & History */}
          <div className="dashboard-column left">
            <JournalForm onSubmit={handleAddEntry} isLoading={isLoading} />
            
            <div className="history-logs-panel" id="previous-entries-timeline">
              <div className="panel-header">
                <h3>Your Logs ({entries.length})</h3>
                {entries.length > 0 && (
                  <button onClick={handleClearHistory} className="clear-history-btn" title="Clear all history">
                    Clear All
                  </button>
                )}
              </div>
              
              {entries.length === 0 ? (
                <div className="empty-history-card">
                  <p>No logged entries yet. Write your thoughts and scores above to add logs to your history.</p>
                </div>
              ) : (
                <div className="history-scroll-container">
                  {entries.map((entry) => (
                    <div key={entry.id} className="history-log-item">
                      <div className="log-item-top">
                        <span className="log-item-date">{entry.date}</span>
                        <span className="log-item-exam">{entry.examType} ({entry.daysRemaining}d left)</span>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="delete-log-btn"
                          aria-label="Delete entry"
                          title="Delete entry"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="log-item-scores">
                        <span className="score-indicator mood">Mood: {entry.moodScore}</span>
                        <span className="score-indicator energy">Stamina: {entry.energyScore}</span>
                        <span className="score-indicator stress">Stress: {entry.stressScore}</span>
                      </div>
                      <p className="log-item-text">{entry.journalEntry}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Analysis Trigger & AI Insights */}
          <div className="dashboard-column right">
            {entries.length > 0 && (
              <div className="analysis-trigger-panel">
                <div className="trigger-card-content">
                  <span className="pattern-badge-sparkle">
                    <Sparkles size={12} className="spark-icon" />
                    <span>Emotional Pattern Intelligence</span>
                  </span>
                  <h3>Analyze Emotional Cycles</h3>
                  <p>
                    FreeMind scans across all {entries.length} logged days to map triggers, risk timelines, and highlight hidden stress loops you might not notice.
                  </p>
                  
                  <button
                    onClick={handleRunAnalysis}
                    className={`btn btn-primary run-analysis-btn ${isLoading ? "loading" : ""}`}
                    disabled={isLoading || entries.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner" aria-hidden="true"></span>
                        <span>Analyzing Emotional Patterns...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="submit-icon" aria-hidden="true" />
                        <span>Run Pattern Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {result ? (
              <AnalysisReport result={result} entriesCount={entries.length} onReset={handleReset} />
            ) : (
              <div className="empty-analysis-placeholder">
                <div className="placeholder-content">
                  <Sparkles className="placeholder-icon" size={32} />
                  <h3>AI Pattern Intelligence</h3>
                  {entries.length === 0 ? (
                    <p>Start by logging a wellbeing entry on the left to build your emotional history.</p>
                  ) : (
                    <p>You have {entries.length} logs ready. Click **Run Pattern Analysis** above to see your customized stress trigger map and emotional cycles timeline.</p>
                  )}
                  <div className="placeholder-usp-note">
                    <p><em>"Most wellness apps tell you how you feel. FreeMind tells you WHY you keep feeling that way."</em></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={{ marginTop: "60px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
        <p>© {new Date().getFullYear()} FreeMind AI. All rights reserved.</p>
        <p style={{ marginTop: "4px" }}>
          FreeMind is an AI mental pattern companion. It does not diagnose mental illness or provide medical clinical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;
