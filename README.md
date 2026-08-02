# AI-Powered Company Research Assistant 🚀

An autonomous corporate intelligence assistant built with Next.js 15, TypeScript, Tailwind CSS, Serper.dev, OpenRouter AI, PDFKit, and Discord API.

The application converts any company name or domain URL into a comprehensive, verified executive research report and downloadable PDF.

---

## 🌟 Key Features

1. **Company & Website Resolution (Serper.dev)**: Resolves official company domains and entity details directly from user inputs.
2. **Domain-Restricted Web Crawler**: Discovers key internal pages (`/about`, `/products`, `/services`, `/contact`, `/pricing`) while avoiding noise (`login`, `terms`, static assets).
3. **Structured Data Extraction**: Normalizes contact info, addresses, offerings, social profiles, and structural links prior to AI analysis to optimize token usage.
4. **AI Research Synthesis (OpenRouter)**: Synthesizes Executive Summaries, Industry Classification, Target Audience, Customer Pain Points, and a full SWOT Matrix in strict JSON.
5. **Serper Competitor Verification**: Cross-references AI-suggested competitors against live Serper search to resolve official company names, websites, industries, and headquarters.
6. **Unified Research Pipeline**: Single backend orchestrator service (`/api/company/research`) coordinating the complete end-to-end research workflow.
7. **Professional PDF Export**: Generates styled executive PDF reports with document headers, SWOT grids, competitor tables, and page footers.
8. **Discord Bot Integration**: Allows sending the complete research summary and PDF dossier attachment directly to any Discord channel via bot webhooks.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, PostCSS
- **Search & Resolution API**: Serper.dev API
- **AI Synthesis API**: OpenRouter API (`google/gemini-2.0-flash-001`)
- **PDF Generation**: PDFKit
- **Icons & UI Utilities**: clsx, tailwind-merge

---

## 🏗️ Architecture & Pipeline Flow

```text
User Input (Company Name or URL)
           │
           ▼
[POST /api/company/research] Unified Backend Pipeline
           │
 1. Serper Company Resolution ──► Resolves official website & name
           │
 2. Domain-Restricted Crawler  ──► Crawls priority internal pages
           │
 3. Structured Data Extractor ──► Extracts clean contact, products & services
           │
 4. OpenRouter AI Synthesizer ──► Generates Executive Summary & SWOT Matrix
           │
 5. Serper Competitor Verifier ──► Resolves competitor websites & locations
           │
           ▼
Unified Research Report (JSON) ──► Frontend UI Display & PDF Export
```

---

## 📁 Folder Structure

```text
src/
├── app/
│   ├── api/
│   │   ├── company/
│   │   │   ├── analyze/        # AI Analysis API
│   │   │   ├── competitors/    # Competitor Verification API
│   │   │   ├── crawl/          # Website Crawler API
│   │   │   ├── export-pdf/     # PDF Export API
│   │   │   ├── extract/        # Data Extraction API
│   │   │   ├── research/       # Unified Pipeline API
│   │   │   ├── resolve/        # Company Resolution API
│   │   │   └── send-discord/   # Discord Submission API
│   │   └── health/             # Health Check API
│   ├── globals.css             # Tailwind Stylesheet
│   ├── layout.tsx              # Root Layout
│   └── page.tsx                # Main Landing Page & UI
├── components/
│   └── Header.tsx              # Application Header
├── lib/
│   ├── constants.ts            # Shared App Constants
│   └── utils.ts                # Class merging helpers
├── services/
│   ├── competitors.ts          # Serper Competitor Verifier
│   ├── crawler.ts              # Domain Web Crawler
│   ├── dataExtractor.ts        # Data Normalization Service
│   ├── discord.ts              # Discord Bot Webhook Handler
│   ├── extractor.ts            # HTML Text & Link Cleaner
│   ├── llm.ts                  # OpenRouter LLM Service
│   ├── pdfGenerator.ts         # PDFKit Document Generator
│   ├── researchPipeline.ts     # Unified Pipeline Orchestrator
│   └── serper.ts               # Serper Search Service
└── types/
    └── index.ts                # TypeScript Interfaces
```

---

## ⚙️ Environment Variables Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Define the required API keys in `.env`:

```env
NEXT_PUBLIC_APP_NAME="Company Research Assistant"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Required for Serper Search & Competitor Verification
SERPER_API_KEY="your_serper_api_key_here"

# Required for AI Synthesis
OPENROUTER_API_KEY="your_openrouter_api_key_here"
OPENROUTER_MODEL="google/gemini-2.0-flash-001"

# Optional default Discord Bot Token
DISCORD_BOT_TOKEN="your_discord_bot_token_here"
```

---

## 🚀 Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Verify API Health**:
   ```bash
   curl http://localhost:3000/api/health
   ```

---

## 📦 Production Build & Deployment

To verify and test production build locally:

```bash
# Run ESLint validation
npm run lint

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📄 License

MIT License. Built for hackathon submission.
