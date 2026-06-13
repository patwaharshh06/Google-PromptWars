import { Brain } from "lucide-react";

export function Header() {
  return (
    <header className="app-header" role="banner">
      <div className="header-container">
        <div className="header-logo" aria-label="FreeMind logo">
          <Brain className="logo-icon" aria-hidden="true" />
          <h1>FreeMind</h1>
        </div>
      </div>
    </header>
  );
}
