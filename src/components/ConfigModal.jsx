import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  X, 
  SlidersHorizontal, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  CreditCard, 
  Database,
  ExternalLink,
  Save,
  Key,
  Bot,
  Sparkles,
  Share2,
  Radio
} from 'lucide-react'

export default function ConfigModal() {
  const { isConfigModalOpen, setIsConfigModalOpen, isSupabaseConfigured } = useAuth()

  // Meta Marketing API (Graph API)
  const [metaAccessToken, setMetaAccessToken] = useState(localStorage.getItem('adpilot_cfg_meta_token') || '')
  const [metaAdAccountId, setMetaAdAccountId] = useState(localStorage.getItem('adpilot_cfg_meta_ad_account') || '')
  const [metaAppId, setMetaAppId] = useState(localStorage.getItem('adpilot_cfg_meta_app_id') || '')

  // LLM APIs
  const [groqKey, setGroqKey] = useState(localStorage.getItem('adpilot_cfg_groq_key') || '')
  const [openaiKey, setOpenaiKey] = useState(localStorage.getItem('adpilot_cfg_openai_key') || '')

  // Safepay & Supabase
  const [supabaseUrl, setSupabaseUrl] = useState(import.meta.env.VITE_SUPABASE_URL || '')
  const [supabaseKey, setSupabaseKey] = useState(import.meta.env.VITE_SUPABASE_ANON_KEY || '')
  const [safepayKey, setSafepayKey] = useState(import.meta.env.VITE_SAFEPAY_API_KEY || '')
  const [commissionRate, setCommissionRate] = useState(import.meta.env.VITE_PLATFORM_COMMISSION_PERCENT || '10')
  const [saveSuccess, setSaveSuccess] = useState(false)

  if (!isConfigModalOpen) return null

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('adpilot_cfg_meta_token', metaAccessToken)
    localStorage.setItem('adpilot_cfg_meta_ad_account', metaAdAccountId)
    localStorage.setItem('adpilot_cfg_meta_app_id', metaAppId)
    localStorage.setItem('adpilot_cfg_groq_key', groqKey)
    localStorage.setItem('adpilot_cfg_openai_key', openaiKey)
    localStorage.setItem('adpilot_cfg_supabase_url', supabaseUrl)
    localStorage.setItem('adpilot_cfg_supabase_key', supabaseKey)
    localStorage.setItem('adpilot_cfg_safepay_key', safepayKey)
    localStorage.setItem('adpilot_cfg_commission', commissionRate)

    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
      setIsConfigModalOpen(false)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-2xl text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsConfigModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">AdPilot AI Integration Settings</h3>
            <p className="text-xs text-slate-500">
              Configure Meta Marketing API, LLM Creative Engine, Safepay & Supabase
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Configuration settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">

          {/* 1. Meta Marketing API (Graph API) Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-600" />
                <span>Meta Marketing API (Facebook & Instagram Ads)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Graph API v21.0
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-600">Meta Access Token (System User / Graph API)</label>
                <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">
                  Graph Explorer →
                </a>
              </div>
              <input
                type="password"
                value={metaAccessToken}
                onChange={(e) => setMetaAccessToken(e.target.value)}
                placeholder="EAA..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Meta Ad Account ID</label>
                <input
                  type="text"
                  value={metaAdAccountId}
                  onChange={(e) => setMetaAdAccountId(e.target.value)}
                  placeholder="act_1234567890"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-600 block mb-1">Meta App ID</label>
                <input
                  type="text"
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                  placeholder="123456789012345"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-blue-600"
                />
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Powers automated campaign creation, budget rebalancing, pausing/resuming, and real-time performance insights from Meta Ads Manager.
            </p>
          </div>

          {/* 2. LLM API Section (Groq / OpenAI) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>LLM Ad Copy & Keyword Generation</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                Groq / OpenAI
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-600">Groq API Key (Recommended for speed)</label>
                <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:underline">
                  Get Free Key →
                </a>
              </div>
              <input
                type="password"
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-600">OpenAI API Key (Alternative)</label>
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-600 hover:underline">
                  Get Key →
                </a>
              </div>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* 3. Safepay Sandbox Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-cyan-600" />
                <span>Safepay Sandbox Payment Gateway</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                Sandbox Mode
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Safepay API Key</label>
              <input
                type="text"
                value={safepayKey}
                onChange={(e) => setSafepayKey(e.target.value)}
                placeholder="sec_sandbox_example_key"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Platform Commission Rate (%)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                placeholder="10"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* 4. Supabase Section */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Supabase Configuration</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {isSupabaseConfigured ? 'Live Supabase' : 'Active (OTP Sandbox)'}
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Supabase Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-600 block mb-1">Supabase Anon Key</label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-[11px] outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(false)}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
