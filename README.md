# EXAMMIND AI

An AI-powered mental wellness companion for students preparing for high-pressure competitive exams (like JEE, NEET, UPSC, CAT, CUET, GATE).

---

## 1. Problem Statement

Students preparing for high-pressure competitive examinations often suffer from severe stress, burnout, anxiety, self-doubt, emotional exhaustion, fear of failure, and a lack of motivation. Most wellness trackers only collect numeric mood scores and fail to understand the complex study-pressure dynamics or the "why" behind the emotions. 

ExamMind AI bridges this gap by leveraging Generative AI to analyze open-ended student journals, detect emotional patterns, identify hidden stress triggers, classify risk levels, and provide actionable, contextual coping strategies.

---

## 2. Solution Overview

ExamMind AI is a secure, single-page React + TypeScript web application powered by **Google Gemini 1.5 Flash**. The core user journey consists of:
1. **Input Metrics**: Student name (optional), competitive exam type, days remaining until the exam, mood score (1-10), energy score (1-10), and stress score (1-10).
2. **Daily Journal**: An open-ended text input where students write about their preparation, self-doubt, study logs, or external pressure.
3. **AI Analysis & Recommendations**: The application securely calls the Gemini Flash API using structured JSON output to analyze the entry.
4. **Emotional Feedback**:
   - **Emotional Summary**: Comprehensive description of current emotional state.
   - **Stress Trigger Detection**: Lists specific factors causing anxiety (e.g. mock tests, peer comparison, time constraint).
   - **Emotional Patterns**: Identifies recurring themes (e.g., self-comparison loops).
   - **Risk Assessment**: Classifies the student's wellbeing into Low, Moderate, or High Risk, providing detailed reasoning.
   - **Personalized Coping Strategies**: Context-aware, actionable advice.
   - **Encouragement**: Compassionate, realistic motivation avoiding toxic positivity.
   - **Mindful Action Plan**: Today (small immediate step), This Week (improvement action), and Before Exam (long-term mindset/prep advice).
5. **Severe Distress Care**: If extreme distress is detected, a highly visible, compassionate support card is displayed containing India's national mental health helpline contacts (Tele-MANAS, Sneha, Vandrevala Foundation).

---

## 3. Architecture

The application is built on a decoupled, lightweight client-side structure focusing on correctness, security, accessibility, and high performance:

```
├── .env.example             # Template for API Key configuration
├── .gitignore               # Blocklist for secrets (.env, node_modules, dist)
├── index.html               # Main HTML wrapper (semantic, accessible setup)
├── package.json             # Core dependencies (Vite, React, Gemini SDK, Lucide)
├── tsconfig.json            # Strict TypeScript configuration
├── src/
│   ├── main.tsx             # Application mount point
│   ├── App.tsx              # State orchestrator, error handling, layout control
│   ├── index.css            # Unified typography, dark slate variables, layout styles
│   ├── App.css              # Cleared config styles (empty)
│   ├── components/
│   │   ├── Header.tsx       # Header banner & Gemini API config modal
│   │   ├── JournalForm.tsx  # Form input validation and radio button scoring
│   │   └── AnalysisReport.tsx # Structured report card display with helpline support
│   ├── utils/
│   │   ├── gemini.ts        # Gemini AI SDK client, system prompts, JSON parsing
│   │   └── validation.ts    # Form input schema validation logic
│   └── tests/
│       └── wellness.test.ts # Focused vitest suite for validation, prompts, and parsing
```

---

## 4. Environment Variables

To prevent hardcoding secrets, ExamMind AI uses environment variables. 
Create a `.env` file in the root directory and define the following key:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

*Note: If the key is not set in the `.env` file, the application features an in-app **API Settings** panel in the header where users can input and save their Gemini API key securely in their browser's local storage.*

---

## 5. Setup Instructions

Ensure you have **Node.js** (v20+) and **npm** installed.

1. Clone or download the repository files.
2. Open a terminal in the root directory and install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Run the local development server:
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at `http://localhost:5173`.

---

## 6. Build Instructions

To build the static application bundle for production:

```bash
npm run build
```

This compiles TypeScript code and bundles optimized CSS and JS assets into the `dist` directory. The production bundle size is extremely small and light (~250 KB in total).

---

## 7. Testing Instructions

To run the automated test suite testing validation logic, prompt structure, risk classification, and response parsing:

```bash
npm test
# Or to run once:
npx vitest run
```

---

## 8. Deployment Instructions

This application is fully client-side and can be hosted on any static hosting provider (GitHub Pages, Netlify, Vercel, Firebase Hosting):

### Deploying to Netlify (CLI)
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build the app: `npm run build`
3. Deploy the build: `netlify deploy --dir=dist --prod`

### Deploying to Vercel (CLI)
1. Install Vercel CLI: `npm install -g vercel`
2. Run deploy command: `vercel --prod` (specify the build output directory as `dist` when prompted)
