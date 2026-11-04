import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  getCurrentUser,
  signInWithGoogle,
  sendOtpEmail,
  verifyOtpToken,
  signInWithEmailPassword,
  signUpWithEmailPassword,
  resetPasswordForEmail,
  directInstantUnlock,
  signOutUser,
  isSupabaseConfigured,
  supabase
} from '../services/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('signin') // 'signin' | 'signup' | 'forgot'

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (err) {
        console.error('Failed to load session:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen to Supabase auth events if live client exists
    if (isSupabaseConfigured && supabase) {
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user)
          localStorage.setItem('adpilot_session', JSON.stringify(session.user))
        } else {
          setUser(null)
          localStorage.removeItem('adpilot_session')
        }
      })
      return () => {
        listener?.subscription?.unsubscribe()
      }
    }
  }, [])

  const loginWithGoogle = async () => {
    const res = await signInWithGoogle()
    if (res?.user) {
      setUser(res.user)
      setIsAuthModalOpen(false)
    }
    return res
  }

  const requestOtp = async (email) => {
    return await sendOtpEmail(email)
  }

  const verifyOtp = async (email, token) => {
    const res = await verifyOtpToken(email, token)
    if (res?.user) {
      setUser(res.user)
      setIsAuthModalOpen(false)
    }
    return res
  }

  const loginWithPassword = async (email, password) => {
    const res = await signInWithEmailPassword(email, password)
    if (res?.user) {
      setUser(res.user)
      setIsAuthModalOpen(false)
    }
    return res
  }

  const signupWithPassword = async (email, password, metadata) => {
    const res = await signUpWithEmailPassword(email, password, metadata)
    if (res?.user) {
      setUser(res.user)
      setIsAuthModalOpen(false)
    }
    return res
  }

  const sendPasswordReset = async (email) => {
    return await resetPasswordForEmail(email)
  }

  const directUnlock = async (email) => {
    const res = await directInstantUnlock(email)
    if (res?.user) {
      setUser(res.user)
      setIsAuthModalOpen(false)
    }
    return res
  }

  const logout = async () => {
    await signOutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        loginWithGoogle,
        loginWithPassword,
        signupWithPassword,
        sendPasswordReset,
        directUnlock,
        requestOtp,
        verifyOtp,
        logout,
        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
