import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CampaignProvider, useCampaign } from './context/CampaignContext'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import UnifiedApp from './components/UnifiedApp'
import AdminPanel from './components/AdminPanel'
import AuthModal from './components/AuthModal'
import ContactModal from './components/ContactModal'
import { LayoutDashboard, Sparkles, ShieldCheck } from 'lucide-react'

function MainContent() {
  const { user } = useAuth()
  const { activeTab, setActiveTab } = useCampaign()
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [viewMode, setViewMode] = useState('app') // 'app' | 'landing' | 'admin'

  // Admin status check (Only accessible when logged in with admin credentials e.g. admin@adpilot.ai)
  const isAdmin = Boolean(
    user?.email?.toLowerCase().includes('admin') ||
    user?.user_metadata?.role === 'admin'
  )

  // 1. Non-logged-in visitors ALWAYS see Landing Page (No public Admin button)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar onOpenContact={() => setIsContactOpen(true)} />
        <main className="flex-1">
          <LandingPage onOpenContact={() => setIsContactOpen(true)} />
        </main>
        <AuthModal />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </div>
    )
  }

  // 2. Admin User View (Only when logged in with unique admin account)
  if (isAdmin && (viewMode === 'admin' || activeTab === 'admin')) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <div className="bg-white border-b border-slate-200 shadow-xs px-4 py-2.5 flex items-center justify-between text-xs z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-700">
              Logged in as Master Admin: <strong className="text-slate-900 font-mono">{user.email}</strong>
            </span>
          </div>
          <button
            onClick={() => {
              setViewMode('app')
              setActiveTab('overview')
            }}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Switch to Client App View ➔</span>
          </button>
        </div>
        <main className="flex-1">
          <AdminPanel onBack={() => {
            setViewMode('app')
            setActiveTab('overview')
          }} />
        </main>
        <AuthModal />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </div>
    )
  }

  // 3. Logged-in user chooses to view public landing page
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 flex items-center justify-between text-xs z-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-slate-700">
              Logged in as <strong className="text-slate-900">{user.user_metadata?.full_name || user.email}</strong>
            </span>
          </div>
          <button
            onClick={() => setViewMode('app')}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Open AI Ad Dashboard ➔</span>
          </button>
        </div>
        <Navbar onOpenContact={() => setIsContactOpen(true)} />
        <main className="flex-1">
          <LandingPage onOpenContact={() => setIsContactOpen(true)} />
        </main>
        <AuthModal />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </div>
    )
  }

  // 4. Regular Logged-in user enters Unified AdPilot AI Platform
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <UnifiedApp 
        onViewLandingPage={() => setViewMode('landing')}
        onViewAdmin={isAdmin ? () => setViewMode('admin') : null}
      />
      <AuthModal />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CampaignProvider>
        <MainContent />
      </CampaignProvider>
    </AuthProvider>
  )
}
