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
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [viewMode, setViewMode] = useState('app') // 'app' | 'landing'

  // Admin status check (Only accessible when logged in with admin credentials e.g. admin@gmail.com)
  const isAdmin = Boolean(
    user?.email?.toLowerCase() === 'admin@gmail.com' ||
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

  // 2. Admin User View: When logged in as admin (admin@gmail.com), ONLY show Admin Dashboard!
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <main className="flex-1">
          <AdminPanel />
        </main>
        <AuthModal />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </div>
    )
  }

  // 3. Regular logged-in user chooses to view public landing page
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

  // 4. Regular Logged-in client enters Unified AdPilot AI Platform
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <UnifiedApp 
        onViewLandingPage={() => setViewMode('landing')}
        onViewAdmin={null}
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
