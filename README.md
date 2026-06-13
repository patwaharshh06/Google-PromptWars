# FreeMind AI

FreeMind AI is a polished **AI Mental Wellness Copilot for Competitive Exams** designed for students preparing for high-pressure examinations (such as JEE, NEET, UPSC, CAT, CUET, GATE). 

Unlike standard mood trackers or journal apps that simply tell you *how* you feel, FreeMind's core USP is:
> **"Most wellness apps tell you how you feel. FreeMind tells you WHY you keep feeling that way."**

FreeMind operates as an **AI-powered Emotional Pattern Intelligence & Root Cause Engine**, analyzing emotional cycles across multiple journal entries over time to uncover hidden stress triggers, typical trigger sequence flows, pattern confidence ratings, and intervention forecasts.

---

## 1. Core Features & User Experience

1. **Today's Check-in**: A conversational logging form collecting name, exam type, days remaining, mood/stamina/stress scores (1-10), and an open-ended journal log.
2. **Logs Timeline**: Chronological record of logged entries saved securely in the browser's local storage.
3. **AI Guided Intervention Center**:
   - **Your Current State**: Three compact metrics displaying Emotional Health Score (out of 10), Burnout Risk (Low, Moderate, High), and Confidence Trend (Stable, Improving, Declining).
   - **Root Cause Analysis (Hero Discovery Card)**: Highlights the primary root cause of the student's stress (e.g. Peer Comparison, Syllabus Overload, Fear of Failure), confidence impact level, observed frequency, typical trigger sequence flows, and a verification confidence percentage.
   - **Why FreeMind Believes This**: A list of 3 specific evidence points derived from journal logs.
   - **What To Do Next (Intervention Forecast)**: Predicts expected outcomes if the stress pattern continues and provides concrete actions (Immediate Action, Next 7 Days, Long-Term Adjustment).
   - **Coach Reflection**: One short, powerful, 1-2 sentence AI coach quote for daily encouragement.
4. **Severe Distress Care**: Auto-detects crisis keywords to render visible support cards referencing national helplines (Tele-MANAS, Kiran, Vandrevala Foundation, Sneha India).

---

## 2. Architecture & Security

FreeMind follows a secure, serverless architecture that prevents client-side exposure of API keys:

```
Frontend (React + TypeScript)
        ↓
Serverless API Endpoint (/api/analyze)
        ↓  [Secure Server-Side GEMINI_API_KEY]
Google Gemini API (1.5 Flash Model)
```

- **Frontend**: Lightweight React SPA bundled using Vite. Never exposes or stores the Gemini API key.
- **Backend API**: Netlify Function hosted at `netlify/functions/analyze.ts` (mapped to `/api/analyze` locally and in production). Securely retrieves `GEMINI_API_KEY` from environment variables, queries Gemini with strict JSON schema structures, and validates the response schema.

---

## 3. Environment Variables

To configure the application, define the following environment variable on your hosting provider or in a local `.env` file at the project root:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## 4. Local Development

Ensure you have **Node.js** (v20+) and **npm** installed.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
   *Note: Vite config proxy is pre-configured so that calls to `/api/analyze` are automatically served locally using the serverless handler code, loading credentials securely from the `.env` file.*
3. Open `http://localhost:5173` in your browser.

---

## 5. Testing

To run the automated vitest suite verifying input validation, prompt formatting, response parsing, and risk calculations:

```bash
npx vitest run
```

---

## 6. Build & Production Deployment

To compile and build optimized, production-ready static assets:

```bash
npm run build
```

The compiled SPA assets will be saved in `dist/`. The Netlify Functions will compile under `netlify/functions/`. Specify the build folder as `dist` and deploy to Netlify or other serverless hosting providers.
