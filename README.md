# 🚀 AdPilot AI — Autonomous Ad Strategy & Retainer Platform

**AdPilot AI** is a full-stack SaaS web application built with **React.js**, **Tailwind CSS**, and **Supabase Backend** (Google OAuth & Free OTP Email Verification). It integrates **Groq/OpenAI LLM APIs** to automatically formulate high-ROAS marketing strategies, viral keywords, trending hashtags, and high-converting ad copies, paired with **Safepay Sandbox Checkout** for direct ad budget and platform commission management.

---

## 🌟 Key Features

1. **Brand Identity & Aesthetics**:
   - **Main Logo** (`src/assets/logo.png`): Displayed in the Navbar header.
   - **Favicon** (`public/favicon.ico`): Circular "AP" secondary logo linked in `index.html`.
   - Ultra-premium dark-mode design system with glassmorphism and subtle micro-animations.

2. **Supabase Authentication**:
   - **Google OAuth** 1-click login.
   - **Free OTP Email Verification**: Passwordless 6-digit authentication.
   - Instant Demo Profiles (Alex - E-commerce DTC, Sophia - B2B SaaS).

3. **LLM API Creative Engine (Groq / OpenAI)**:
   - Input your **Business Niche** (e.g. Ergonomic Home Office Gear, Korean Skincare, B2B SaaS).
   - Generates **Viral Search Keywords** with 1-click copy.
   - Formats **Trending Platform Hashtags** (`#TikTokMadeMeBuyIt`, `#AdPilotScale`, etc.).
   - Writes **3 High-Converting Ad Copy Angles**:
     * **Problem-Agitation-Solution (PAS)** (Pain-point hook)
     * **Viral UGC / Social Proof** (Customer validation hook)
     * **Direct Urgency / Scarcity** (Limited-time conversion hook)
   - Calculates recommended ad media budget and funnel allocation (TOFU/MOFU/BOFU).

4. **Multi-Channel Media Creative Uploader**:
   - Drag-and-drop or file selector for 1:1 Feed images and 9:16 vertical video assets.
   - AI creative compliance score, aspect ratio tagging, and 1-click sample creative insertion.

5. **Safepay Sandbox Payment Gateway**:
   - **Commission Percentage Model**: Automatically computes total cost:
     $$\text{Total Payable} = \text{Ad Budget} + (\text{Ad Budget} \times \text{Commission Rate \%})$$
   - Default commission: **10%** (configurable via `.env` or in-app Settings).
   - Order initialization via `/api/safepay/init-checkout`.
   - **Success Callback**: Verified transaction receipt, tracker token, instant campaign deployment, and confetti celebration.
   - **Failure Callback**: Diagnostic error handling (declined/cancelled), state preservation (no lost creatives or copy drafts), and 1-click retry.

6. **Autonomous Performance Dashboard & Retainer Management**:
   - Live KPI cards: Media Spend, Blended ROAS, Revenue, Conversions, CPA, and Commission.
   - 30-Day Conversion & Spend Velocity visual charts.
   - AI Autonomous Activity Log streaming real-time optimizations.
   - Monthly Retainer & Rollover Budget tracker.
   - 4 Autonomous safety toggles (Dynamic Bidding, Creative Fatigue, Cross-Network Rebalance, Emergency Stop-Loss).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Backend API**: Express.js integrated via Vite API plugin (`server/index.js`, `server/apiPlugin.js`)
- **AI / LLM**: Groq API (`llama-3.3-70b-versatile`), OpenAI API (`gpt-4o-mini`), with built-in creative engine fallback
- **Payments**: Safepay Sandbox API (`https://sandbox.api.getsafepay.com`)
- **Authentication**: Supabase Auth (Google OAuth & Free OTP Email)

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your API credentials:
```env
# Groq LLM API (Ultra-fast ad copy generation)
GROQ_API_KEY=gsk_your_groq_key_here

# Alternatively, OpenAI API Key
OPENAI_API_KEY=sk-proj-your_openai_key_here

# Safepay Sandbox Keys
SAFEPAY_API_KEY=sec_sandbox_example_key
SAFEPAY_SECRET_KEY=sandbox_secret_key_here
SAFEPAY_ENV=sandbox

# Platform Commission Model (% on top of ad budget)
VITE_PLATFORM_COMMISSION_PERCENT=10

# Supabase Auth
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```
*(Note: If API keys are omitted, AdPilot AI runs with intelligent sandbox simulators so you can evaluate the entire user flow immediately!)*

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://127.0.0.1:5173](http://127.0.0.1:5173)** in your browser.

---

## ☁️ Deploying on Vercel

1. **Push to GitHub**:
   Ensure your code is pushed to your GitHub repository:
   `https://github.com/Waqas-110/Adpilot-Ai-`

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Click **Import** next to your `Adpilot-Ai-` repository.
   - Framework Preset will automatically detect **Vite**.

3. **Configure Environment Variables in Vercel**:
   Add the following environment variables under **Settings > Environment Variables**:
   - `GROQ_API_KEY`
   - `SAFEPAY_API_KEY`
   - `VITE_SAFEPAY_API_KEY`
   - `SAFEPAY_SECRET_KEY`
   - `SAFEPAY_ENV` = `sandbox`
   - `VITE_PLATFORM_COMMISSION_PERCENT` = `10`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `META_ACCESS_TOKEN`
   - `META_AD_ACCOUNT_ID`

4. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend and serve both the Vite client and the `/api` serverless backend via `vercel.json` and `api/index.js`.

---

## 👨‍💻 Developer & Author

**Waqas Anwar**  
- **GitHub**: [@Waqas-110](https://github.com/Waqas-110)  
- **Repository**: [Adpilot-Ai-](https://github.com/Waqas-110/Adpilot-Ai-)  
- **Role**: Lead Full-Stack & AI Systems Architect


---

## 💳 Testing Safepay Sandbox Payments

In the Safepay Checkout Modal, use the pre-filled test card credentials:
- **Card Number**: `4242 4242 4242 4242`
- **Expires**: `12/28`
- **CVV**: `888`
- **Test Success**: Click **"Authorize & Pay (Success Callback)"** to deploy the live campaign with celebratory confetti and digital receipt.
- **Test Failure**: Click **"Test Failure Callback"** to inspect the error diagnostics, retry options, and draft preservation.
