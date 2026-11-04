import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCampaign } from '../context/CampaignContext'
import { calculateCampaignCosts, formatPKR } from '../services/safepay'
import { 
  Rocket, 
  Sparkles, 
  Bot, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  Layers, 
  Zap, 
  Target, 
  Play, 
  ChevronRight, 
  ChevronDown,
  DollarSign, 
  BarChart3, 
  Sliders,
  Check,
  Building2,
  Users,
  Radio,
  Flame,
  MessageSquare,
  HelpCircle,
  Clock,
  ArrowUpRight,
  X
} from 'lucide-react'
import adPilotLogo from '../assets/logo.png'

export default function LandingPage({ onOpenContact }) {
  const { user, setIsAuthModalOpen, setAuthModalMode } = useAuth()
  const { setShowAiChatbot, setActiveTab } = useCampaign()

  const [calcBudget, setCalcBudget] = useState(50000)
  const [openFaq, setOpenFaq] = useState(0)

  const calcCosts = calculateCampaignCosts(calcBudget, 10)
  const projectedRevenue = Math.round(calcBudget * 4.3)
  const estimatedConversions = Math.round(calcBudget / 420)

  const handleStart = () => {
    if (!user) {
      setAuthModalMode('signup')
      setIsAuthModalOpen(true)
    } else {
      setShowAiChatbot(true)
    }
  }

  const faqs = [
    {
      q: 'How does AdPilot AI connect with Meta Ads Manager (Facebook & Instagram)?',
      a: 'AdPilot AI integrates directly with the official Meta Marketing API (Graph API v21.0). Once your campaign and creative hooks are approved and checked out via Safepay, AdPilot automatically creates your Meta Campaign, targets your audience, sets daily budgets, and streams live performance data (impressions, clicks, ROAS) straight back to your dashboard.'
    },
    {
      q: 'What is the 10% platform commission retainer model?',
      a: 'Instead of traditional marketing agencies that charge rigid $3,000–$5,000/month flat management fees regardless of results, AdPilot AI charges a transparent 10% performance management commission on top of your direct ad budget. 100% of your media spend goes directly into Meta/Google ad networks, and our 10% fee covers 24/7 AI bid optimization and creative maintenance.'
    },
    {
      q: 'What is the "Rollover Budget" feature?',
      a: 'If our AI auto-pilot pauses underperforming ads or saves budget due to high ROAS efficiency, any unspent ad media budget is preserved and automatically carries over into your next billing cycle. You never lose a single cent of your marketing dollars.'
    },
    {
      q: 'How does the Groq LLM Ad Copy & Keyword Generator work?',
      a: 'When you enter your business niche and product details into our AI Chatbot, our backend calls Groq (Llama-3.3-70b / GPT-OSS 120B) to formulate 8–10 viral keywords, trending platform hashtags (#TikTokMadeMeBuyIt, etc.), and 3 proven copywriting angles (Problem-Agitation-Solution, UGC Review, and Urgency Offer).'
    },
    {
      q: 'How do Safepay Sandbox payments work?',
      a: 'Safepay Sandbox allows you to test the complete end-to-end checkout flow risk-free. You can use pre-filled sandbox test cards (4242 4242...) to simulate instant payment clearance, tokenization, and digital invoice receipt generation.'
    }
  ]

  return (
    <div className="space-y-24 sm:space-y-36 pb-24 overflow-hidden bg-slate-50 text-slate-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Ambient Glowing Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-cyan-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>The Autonomous AI Media Buyer & Ad Agency Platform</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        </div>

        {/* Hero Title - High Contrast Light Theme */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-5xl mx-auto leading-[1.12]">
          Deploy High-ROAS Ads on <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">Autopilot</span> with AI Strategy
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          AdPilot AI replaces manual marketing agencies with intelligent software. Input your niche, let Groq LLM generate viral hooks & keywords, upload creatives, and deploy directly to <b className="text-slate-900">Meta (Facebook & Instagram)</b> via Safepay Sandbox checkout.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 group cursor-pointer"
          >
            <Bot className="w-5 h-5 text-amber-300" />
            <span>Start with AI Chatbot</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Request Enterprise Demo</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-600" />
            <span>Meta Marketing API v21.0</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safepay Sandbox Payment Gateway</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Supabase Auth & Free OTP</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>10% Transparent Commission Model</span>
          </div>
        </div>

        {/* Interactive App Visual Showcase */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-3xl bg-white p-3 sm:p-5 border border-slate-200 shadow-xl">
          <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-4 sm:p-6 text-left shadow-inner">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-slate-400 font-mono ml-2">adpilot-ai.app/live-console</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  META MARKETING API: CONNECTED
                </span>
              </div>
            </div>

            {/* Mock Screen Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Groq LLM Copy & Hook Engine</span>
                <p className="text-sm font-bold text-white">3 High-Converting Copy Angles</p>
                <div className="text-xs text-slate-300">PAS Hook + UGC Review + Viral Keywords</div>
                <div className="pt-2 text-xs text-emerald-400 font-mono font-bold">4.3x Projected ROAS</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Safepay Sandbox Payment</span>
                <p className="text-sm font-bold text-white">Ad Media Budget + 10% Commission</p>
                <div className="text-xs text-slate-300">Total: $1,650.00 USD (Escrow Protected)</div>
                <div className="pt-2 text-xs text-indigo-400 font-mono font-bold">Safepay Tracker Tokenized</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Retainer & Rollover</span>
                <p className="text-sm font-bold text-white">Unused Ad Budget Rollover</p>
                <div className="text-xs text-slate-300">$350.00 preserved & carried over cleanly</div>
                <div className="pt-2 text-xs text-cyan-400 font-mono font-bold">100% Transparent Retainer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT IS ADPILOT AI? (AGENCY VS ADPILOT) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Why AdPilot AI?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Traditional Marketing Agencies vs AdPilot AI
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            See how autonomous media buying beats legacy agency retainers in speed, transparency, and ROAS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Traditional Agency Card */}
          <div className="p-8 rounded-3xl bg-red-50/50 border border-red-200 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-red-200">
              <h3 className="text-lg font-bold text-red-700">Traditional Ad Agencies</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 font-bold">
                Outdated & Expensive
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span><b className="text-slate-900">Rs. 80,000 - Rs. 250,000 flat monthly retainers</b> upfront before you see a single order.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Takes <b className="text-slate-900">2–3 weeks</b> of back-and-forth emails just to write copy and launch a campaign.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Unused ad budget is often lost or billed as agency profit.</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span>Manual bid adjustments done once a week during office hours.</span>
              </li>
            </ul>
          </div>

          {/* AdPilot AI Card */}
          <div className="p-8 rounded-3xl bg-white border border-emerald-300 space-y-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900">AdPilot AI Autonomous Platform</h3>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                10x Faster & Smarter
              </span>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><b className="text-slate-900">Transparent 10% Commission Model:</b> You only pay a small commission on direct ad media spend.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><b className="text-slate-900">Instant Launch in 3 Minutes:</b> Groq LLM writes viral keywords, hashtags, and ad copy hooks in seconds.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><b className="text-slate-900">Rollover Budget Protection:</b> Any unspent media budget carries over cleanly to the following month.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><b className="text-slate-900">24/7 Meta API Auto-Pilot:</b> Dynamically reallocates budget and pauses losing creative variations day and night.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. HOW THE AI CHATBOT ONBOARDING WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Conversational Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            From Conversation to Live Meta Ads in 4 Steps
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Say goodbye to complex Meta Business Managers and clunky manual ad setups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">AI Greeting & Niche Input</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upon fast account creation (Email, Password & OTP), our AI asks for your business niche, hero product, and website.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm border border-purple-200">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">Groq LLM Creative Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Groq LLM (Llama 3.3 / GPT-OSS 120B) generates viral search keywords, trending hashtags, and 3 high-converting ad copy angles.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-sm border border-cyan-200">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">Upload Media Creatives</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload 1:1 Feed images or 9:16 vertical video assets for Instagram Reels/TikTok. AI scores creative hook strength.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900">Safepay Checkout & Meta Ads</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Checkout total cost (Ad Budget + 10% Commission) via Safepay Sandbox. Instantly deploys to Meta Marketing API!
            </p>
          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE BUDGET & COMMISSION CALCULATOR */}
      <section id="calculator" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 relative shadow-md">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Transparent Commission Model</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Calculate Your Ad Budget & Commission
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Drag the slider to see exact media spend, our 10% platform commission, and projected returns.
            </p>
          </div>

          {/* Slider */}
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 font-medium">Monthly Media Budget</span>
              <span className="text-2xl font-mono font-extrabold text-slate-900">
                {formatPKR(calcBudget)} <span className="text-xs font-normal text-slate-500">PKR</span>
              </span>
            </div>
            <input
              type="range"
              min="15000"
              max="500000"
              step="5000"
              value={calcBudget}
              onChange={(e) => setCalcBudget(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Rs. 15,000 (Testing)</span>
              <span>Rs. 50,000 (Growth)</span>
              <span>Rs. 500,000+ (Scale)</span>
            </div>
          </div>

          {/* Calculation Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-medium">Direct Ad Media Spend</span>
              <p className="text-xl font-bold text-slate-900 font-mono mt-1">{formatPKR(calcCosts.adBudget)}</p>
              <p className="text-[10px] text-slate-500 mt-1">100% deployed to Meta ad networks</p>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-center">
              <span className="text-[11px] text-indigo-700 uppercase font-medium">AdPilot Commission (10%)</span>
              <p className="text-xl font-bold text-indigo-700 font-mono mt-1">+{formatPKR(calcCosts.commissionAmount)}</p>
              <p className="text-[10px] text-indigo-600/80 mt-1">AI bid management & retainers</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <span className="text-[11px] text-emerald-700 uppercase font-medium">Total Safepay Checkout</span>
              <p className="text-xl font-bold text-emerald-700 font-mono mt-1">{formatPKR(calcCosts.totalAmount)}</p>
              <p className="text-[10px] text-emerald-600/80 mt-1">Processed securely in PKR</p>
            </div>
          </div>

          {/* Projected Output */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs font-bold text-indigo-800">Projected Performance Output</span>
              <div className="flex flex-wrap items-center gap-4 mt-1 text-xs">
                <span className="text-slate-800">Est. Revenue: <b className="text-emerald-700 font-mono">{formatPKR(projectedRevenue)}</b></span>
                <span className="text-slate-800">Est. Orders: <b className="text-cyan-700 font-mono">{estimatedConversions.toLocaleString()}</b></span>
                <span className="text-slate-800">Projected ROAS: <b className="text-indigo-700 font-mono">4.3x</b></span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white flex items-center gap-1.5 transition-all shadow-sm flex-shrink-0 cursor-pointer"
            >
              <span>Deploy This Budget</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. PRICING & RETAINER TIERS */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">
            Transparent Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Flexible Retainer Plans for Every Growth Stage
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Choose between pay-as-you-go commission or dedicated autopilot retainers with rollover protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Starter Autopilot</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">$0</span>
                <span className="text-xs text-slate-500">/ base fee</span>
              </div>
              <p className="text-xs text-slate-600">Ideal for early DTC brands testing initial ad hooks and creatives.</p>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>10% commission on ad spend</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Meta Marketing API deployment</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Groq LLM viral ad copywriting</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
            >
              Get Started
            </button>
          </div>

          {/* Tier 2 (Highlighted) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-indigo-50/50 border-2 border-indigo-500 space-y-5 flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm">
              Most Popular
            </div>
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Growth Autopilot Pro</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">Rs. 35,000</span>
                <span className="text-xs text-slate-600">/ month</span>
              </div>
              <p className="text-xs text-slate-700">For scaling DTC brands in Pakistan spending Rs. 50,000–Rs. 300,000/mo seeking maximum ROAS.</p>
              <ul className="space-y-2.5 text-xs text-slate-800 pt-2 border-t border-indigo-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Everything in Starter</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><b className="text-slate-900">Rollover Budget Protection:</b> Unused spend carries over</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span><b className="text-slate-900">24/7 Dynamic Auto-Bidding</b> on Meta & TikTok</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Creative Fatigue Auto-Rotation</span>
                </li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Start Growth Autopilot
            </button>
          </div>

          {/* Tier 3 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-5 flex flex-col justify-between shadow-xs">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enterprise Retainer</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900 font-mono">Custom</span>
              </div>
              <p className="text-xs text-slate-600">For high-volume brands and marketing agencies managing multiple ad accounts.</p>
              <ul className="space-y-2.5 text-xs text-slate-700 pt-2 border-t border-slate-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Multi-Ad Account Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Dedicated Media Buyer Slack channel</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Custom LLM Model Fine-Tuning</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onOpenContact}
              className="w-full py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* 6. REAL CUSTOMER CASE STUDIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Proven Performance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Brands Scaling with AdPilot AI
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3">
            Real data from DTC e-commerce brands and SaaS companies scaling profitably.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">Lumina Office Apparel</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">
                +380% ROAS
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "We replaced our $4k/month agency with AdPilot AI. The Groq LLM copywriter created 12 hook variations in minutes, and Meta auto-bidding dropped our CPA from $8.40 to $3.62."
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
              <span>Monthly Spend: <b className="text-slate-900">$8,400</b></span>
              <span>Attributed Revenue: <b className="text-emerald-700 font-mono">$36,120</b></span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">FlowState Biohacking</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">
                4.8x ROAS
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "The rollover budget feature alone saved us $1,200 last month. Safepay Sandbox checkout was seamless, and campaigns deployed straight to Instagram Reels without manual friction."
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
              <span>Monthly Spend: <b className="text-slate-900">$4,200</b></span>
              <span>Attributed Revenue: <b className="text-emerald-700 font-mono">$20,160</b></span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">CloudSync B2B SaaS</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-mono font-bold border border-cyan-200">
                -44% Cost Per Demo
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              "We use AdPilot AI to test problem-agitation-solution hooks on Google Performance Max and Meta. The automated creative fatigue alerts keep our CTR above 3.5% consistently."
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
              <span>Monthly Spend: <b className="text-slate-900">$6,500</b></span>
              <span>Qualified Leads: <b className="text-cyan-700 font-mono">410 Demos</b></span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            <span>Frequently Asked Questions</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Everything You Need to Know About AdPilot AI
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. FOOTER WITH CONTACT CTA */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <img src={adPilotLogo} alt="AdPilot AI Logo" className="w-8 h-8 object-contain" />
            <div>
              <span className="text-lg font-bold text-slate-900">
                AdPilot <span className="text-indigo-600">AI</span>
              </span>
              <p className="text-xs text-slate-500">The Autonomous AI Media Buyer & Ad Agency</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenContact}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
            >
              Contact Support / Sales
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
            >
              Launch Campaign
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-slate-500">
          <div>
            <p>© {new Date().getFullYear()} AdPilot AI Inc. All rights reserved. Meta Marketing API v21.0 Certified.</p>
            <p className="mt-1 font-medium text-slate-700 flex items-center gap-1.5">
              <span>Developed by</span>
              <a 
                href="https://github.com/Waqas-110" 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
              >
                Waqas Anwar
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Engineer
                </span>
              </a>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-800 cursor-pointer" onClick={onOpenContact}>Contact Us</span>
            <span className="hover:text-slate-800 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-800 cursor-pointer">Safepay Escrow Protection</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
