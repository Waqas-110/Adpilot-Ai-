import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCampaign } from '../context/CampaignContext'
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  Loader2,
  Sparkles,
  Zap
} from 'lucide-react'
import adPilotLogo from '../assets/logo.png'

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    authModalMode, 
    setAuthModalMode,
    loginWithPassword, 
    signupWithPassword, 
    sendPasswordReset, 
    directUnlock,
    requestOtp, 
    verifyOtp 
  } = useAuth()
  
  const { setShowAiChatbot } = useCampaign()

  // Form Fields
  const [mode, setMode] = useState(authModalMode || 'signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  // Status State
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Keep modal mode in sync with authModalMode trigger
  useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode)
    }
    setErrorMsg('')
    setSuccessMsg('')
  }, [authModalMode, isAuthModalOpen])

  if (!isAuthModalOpen) return null

  // 1. Handle Login (Email + Password)
  const handleSignIn = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both your email and password')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await loginWithPassword(email, password)
      setIsAuthModalOpen(false)
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Handle Password Reset
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await sendPasswordReset(email)
      setSuccessMsg(res?.message || 'Password reset link sent to your email!')
    } catch (err) {
      setErrorMsg(err.message || 'Could not send reset instructions')
    } finally {
      setLoading(false)
    }
  }

  // 3. Handle Send OTP for Signup Email Verification
  const handleSendSignupOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address first')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await requestOtp(email)
      setOtpSent(true)
      setSuccessMsg(`6-digit OTP code sent to ${email}! Please check your email inbox.`)
    } catch (err) {
      setErrorMsg(err.message || 'Could not send OTP code')
    } finally {
      setLoading(false)
    }
  }

  // 4. Handle Verify OTP
  const handleVerifySignupOtp = async () => {
    const cleanToken = (otpToken || '').trim()
    if (!cleanToken || cleanToken.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code received on your email')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      await verifyOtp(email, cleanToken)
      setOtpVerified(true)
      setSuccessMsg('Email successfully verified! ✓ Ab aap "Create Account" daba sakte hain.')
    } catch (err) {
      setOtpVerified(false)
      setErrorMsg(err.message || 'Ghalat OTP code! Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  // 5. Handle Registration Submit (Strict: requires otpVerified)
  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!fullName || !businessName || !email || !password) {
      setErrorMsg('Please fill in all fields (Name, Business Name, Email, Password)')
      return
    }

    if (!otpVerified) {
      setErrorMsg('Pehle OTP verify karein! "Send Free OTP Code" dabayein aur apna 6-digit code enter karke "Verify" karein.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      await signupWithPassword(email, password, { fullName, businessName })
      setIsAuthModalOpen(false)
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn font-sans">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Clean Header with Official Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 p-2 shadow-md shadow-indigo-600/20 mb-3">
            <img src={adPilotLogo} alt="AdPilot AI Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            AdPilot <span className="text-indigo-600">AI</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin' && 'Sign in to access your autonomous Meta ad campaigns'}
            {mode === 'signup' && 'Create your account: Name, Business, Email & OTP'}
            {mode === 'forgot' && 'Direct instant open or password reset'}
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODE 1: LOGIN (EMAIL + PASSWORD) */}
        {/* ================================================================== */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot')
                    setErrorMsg('')
                    setSuccessMsg('')
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                <span>
                  Admin Login:{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@gmail.com')
                      setPassword('123456')
                    }}
                    className="text-indigo-600 font-mono font-bold hover:underline cursor-pointer"
                  >
                    admin@gmail.com
                  </button>
                </span>
                <span className="font-semibold text-emerald-600">Password: 123456</span>
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="pt-3 text-center border-t border-slate-200 text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup')
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 ml-1 cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* ================================================================== */}
        {/* MODE 2: SIGN UP (NAME + BUSINESS + EMAIL + PASS + OTP) */}
        {/* ================================================================== */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Waqas Anwar"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Business / Store Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Apex Global Brands"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="waqas@company.com"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            {/* Email OTP Verification Row */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Email OTP Verification
                </label>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendSignupOtp}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 underline"
                  >
                    Send Free OTP Code
                  </button>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Code sent! Check Inbox
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.target.value)}
                    placeholder="Enter 6-digit OTP code"
                    className="w-full pl-10 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-indigo-600 text-xs text-slate-900 font-mono outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleVerifySignupOtp}
                  disabled={loading || otpVerified}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                    otpVerified 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {otpVerified ? 'Verified ✓' : 'Verify'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all mt-3 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center border-t border-slate-200 text-xs text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ================================================================== */}
        {/* MODE 3: FORGOT PASSWORD */}
        {/* ================================================================== */}
        {mode === 'forgot' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
              <span className="font-bold block">🔑 Reset Your Password:</span>
              <p className="text-slate-600">Enter your registered email address and we will send you password reset instructions.</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs sm:text-sm text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Send Reset Instructions ➔</span>}
            </button>

            <div className="pt-3 text-center border-t border-slate-200 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setErrorMsg('')
                  setSuccessMsg('')
                }}
                className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 ml-1 cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
