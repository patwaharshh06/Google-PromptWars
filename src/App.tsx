import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { JournalForm } from "./components/JournalForm";
import { AnalysisReport } from "./components/AnalysisReport";
import type { JournalInput } from "./utils/validation";
import { analyzeWellbeing, getApiKey } from "./utils/gemini";
import type { AnalysisResult } from "./utils/gemini";
import { AlertCircle, AlertTriangle } from "lucide-react";

export function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(() => !getApiKey());

  useEffect(() => {
    const checkKey = () => {
      setApiKeyMissing(!getApiKey());
    };
    window.addEventListener("focus", checkKey);
    return () => window.removeEventListener("focus", checkKey);
  }, []);

  const handleSubmit = async (data: JournalInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const analysis = await analyzeWellbeing(data);
      setResult(analysis);
      // Scroll to report top after it renders
      setTimeout(() => {
        const reportElement = document.querySelector(".analysis-report");
        if (reportElement) {
          reportElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    // Scroll back to page top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      <Header />
      
      <main role="main">
        {/* Missing API Key Warning */}
        {apiKeyMissing && !result && (
          <div className="alert-banner" role="status">
            <AlertTriangle className="alert-banner-icon" aria-hidden="true" />
            <div className="alert-banner-content">
              <p>
                <strong>Gemini API Key is missing.</strong> Please click the **API Settings** button in the header above to enter your key. The analysis will not run without a key.
              </p>
            </div>
          </div>
        )}

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

        {result ? (
          <AnalysisReport result={result} onReset={handleReset} />
        ) : (
          <JournalForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </main>

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "12px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
        <p>© {new Date().getFullYear()} ExamMind AI. All rights reserved.</p>
        <p style={{ marginTop: "4px" }}>
          EXAMMIND AI is an AI mental companion. It does not diagnose mental illness or provide medical clinical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;
