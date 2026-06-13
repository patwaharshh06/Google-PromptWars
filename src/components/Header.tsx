import { useState } from "react";
import type { FormEvent } from "react";
import { Brain, Settings, X, CheckCircle, AlertCircle } from "lucide-react";
import { saveApiKey, clearApiKey } from "../utils/gemini";

export function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("exammind_api_key") || "");
  const [hasEnvKey] = useState(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    return !!(envKey && envKey.trim() !== "" && envKey !== "YOUR_API_KEY_HERE");
  });
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (apiKeyInput.trim() === "") {
      clearApiKey();
      setStatusMessage({ type: "success", text: "Local API Key cleared. Using environment key if available." });
    } else {
      saveApiKey(apiKeyInput.trim());
      setStatusMessage({ type: "success", text: "API Key saved successfully to local storage!" });
    }
    setTimeout(() => {
      setStatusMessage(null);
      setIsModalOpen(false);
    }, 1500);
  };

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setStatusMessage(null);
  };

  return (
    <header className="app-header" role="banner">
      <div className="header-container">
        <div className="header-logo" aria-label="ExamMind AI logo">
          <Brain className="logo-icon" aria-hidden="true" />
          <h1>EXAMMIND AI</h1>
        </div>
        <p className="header-subtitle">
          Your personalized AI mental wellness companion for competitive exams preparation
        </p>
        <div className="header-actions">
          <button
            onClick={handleToggleModal}
            className="settings-btn"
            aria-label="Gemini API Settings"
            title="Configure Gemini API Key"
          >
            <Settings className="btn-icon" aria-hidden="true" />
            <span>API Settings</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-content">
            <div className="modal-header">
              <h2 id="modal-title">Gemini API Configuration</h2>
              <button
                onClick={handleToggleModal}
                className="close-btn"
                aria-label="Close settings modal"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="settings-form">
              <p className="settings-desc">
                ExamMind AI uses **Gemini 1.5 Flash** to perform emotional analysis.
              </p>

              {hasEnvKey ? (
                <div className="env-status-alert" role="status">
                  <CheckCircle className="alert-icon-success" aria-hidden="true" />
                  <span>
                    API Key detected in environment variables. You do not need to configure one here unless you want to override it.
                  </span>
                </div>
              ) : (
                <div className="env-status-alert warning" role="status">
                  <AlertCircle className="alert-icon-warning" aria-hidden="true" />
                  <span>
                    No API Key detected in environment variables. Please provide one below to enable the AI Analysis.
                  </span>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="api-key-input">Gemini API Key</label>
                <input
                  id="api-key-input"
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  autoComplete="off"
                  className="form-control"
                />
                <span className="help-text">
                  Your key is saved locally in your browser storage and is never sent to any server except directly to Google Gemini.
                </span>
              </div>

              {statusMessage && (
                <div className={`status-banner ${statusMessage.type}`} role="status">
                  {statusMessage.text}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleToggleModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
