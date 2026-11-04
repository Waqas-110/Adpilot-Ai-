import React from 'react'
import { useAuth } from '../context/AuthContext'
import { useCampaign } from '../context/CampaignContext'
import adPilotLogo from '../assets/logo.png'
import { 
  Rocket, 
  Bot, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck, 
  CreditCard, 
  Sparkles,
  Zap
} from 'lucide-react'

export default function Navbar({ onOpenContact }) {
  const { user, logout, setIsAuthModalOpen, setAuthModalMode, isSupabaseConfigured } = useAuth()
  const { setShowAiChatbot, activeTab, setActiveTab } = useCampaign()

  const handleLaunchCampaign = () => {
    if (!user) {
      setAuthModalMode('signup')
      setIsAuthModalOpen(true)
    } else {
      setShowAiChatbot(true)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 border-b border-slate-200 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => {
            if (user) {
              setActiveTab('overview')
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-indigo-50 border border-indigo-200 group-hover:border-indigo-400 transition-all duration-300 shadow-sm">
            {/* Main Logo Image specified in user instructions */}
            <img 
              src={adPilotLogo} 
              alt="AdPilot AI Logo" 
              className="h-10 w-auto max-w-[42px] object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white">
              <Rocket className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 bg-clip-text text-transparent">
                AdPilot <span className="text-indigo-600">AI</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                Autonomous
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide hidden sm:block">
              Rocket & Graph • AI Ad Agency
            </p>
          </div>
        </div>

        {/* Center Navigation Links (When logged out) */}
        {!user ? (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#calculator" className="hover:text-indigo-600 transition-colors">
              ROAS Calculator
            </a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">
              Retainer Pricing
            </a>
            <button
              onClick={onOpenContact}
              className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-slate-600"
            >
              <span>Contact Support</span>
            </button>
          </nav>
        ) : (
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'campaigns'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('retainer')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'retainer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Retainer & Billing
            </button>
            {Boolean(user?.email?.toLowerCase().includes('admin') || user?.user_metadata?.role === 'admin') && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Admin Control
              </button>
            )}
          </div>
        )}

        {/* Right CTA / Auth Status */}
        <div className="flex items-center gap-3">
          {!user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthModalMode('signin')
                  setIsAuthModalOpen(true)
                }}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleLaunchCampaign}
                className="relative group overflow-hidden px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-300"
              >
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Start with AI</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Trigger AI Chatbot anytime */}
              <button
                onClick={() => setShowAiChatbot(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all"
              >
                <Bot className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Ask AI Bot</span>
              </button>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="relative">
                  <img
                    src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.email}`}
                    alt="User Avatar"
                    className="w-8 h-8 rounded-full border border-indigo-200 object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="hidden xl:block text-left text-xs">
                  <p className="font-medium text-slate-800 truncate max-w-[120px]">
                    {user.user_metadata?.full_name || user.email.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}
