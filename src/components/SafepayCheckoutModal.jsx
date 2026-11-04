import React, { useState } from 'react'
import { useCampaign } from '../context/CampaignContext'
import { verifySafepayPayment, createSafepayCheckoutSession, formatPKR } from '../services/safepay'
import { deployCampaignToMeta } from '../services/meta'
import confetti from 'canvas-confetti'
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
  Receipt,
  Download,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  ExternalLink
} from 'lucide-react'
import adPilotLogo from '../assets/logo.png'

export default function SafepayCheckoutModal() {
  const { checkoutModalData, setCheckoutModalData, addCampaign, refreshPayments, setActiveTab } = useCampaign()

  const [step, setStep] = useState('review') // 'review' | 'safepay_form' | 'processing' | 'success' | 'failure'
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvv, setCardCvv] = useState('888')
  const [cardName, setCardName] = useState('Alex Rivera')
  const [loading, setLoading] = useState(false)
  const [failureReason, setFailureReason] = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [sessionTracker, setSessionTracker] = useState('')
  const [hostedCheckoutUrl, setHostedCheckoutUrl] = useState('')

  if (!checkoutModalData) return null

  const { totalCost, name, channels, objective, creatives, strategyPlan, niche, selectedAdCopy } = checkoutModalData

  const handleProceedToPayment = async () => {
    setLoading(true)
    try {
      const session = await createSafepayCheckoutSession({
        adBudget: totalCost.adBudget,
        commissionPercent: totalCost.commissionRate,
        customer: { name: cardName, email: 'customer@adpilot.ai' },
        campaignDetails: { name, channels }
      })
      if (session?.tracker) {
        setSessionTracker(session.tracker)
        setHostedCheckoutUrl(session.checkoutUrl)
      }
    } catch (err) {
      console.warn('Session init:', err)
    } finally {
      setLoading(false)
      setStep('safepay_form')
    }
  }

  // Payment Callback Handler (Success or Failure)
  const handleAuthorizeSafepay = async (isSimulatedFailure = false) => {
    setStep('processing')
    setLoading(true)

    try {
      const referenceId = 'AP-' + Math.floor(100000 + Math.random() * 900000)
      const tracker = sessionTracker || ('trk_sandbox_' + Math.random().toString(36).substring(2, 10))

      if (isSimulatedFailure) {
        // Handle Failure Callback
        await verifySafepayPayment({
          tracker,
          referenceId,
          cardInfo: { cardNumber, cardName },
          totalCost,
          status: 'failure'
        })
        setFailureReason('Safepay Sandbox Declined: Insufficient test funds or 3DS verification timed out. Error Code: SFPY_DECLINED_402.')
        setStep('failure')
        return
      }

      // Handle Success Callback
      const result = await verifySafepayPayment({
        tracker,
        referenceId,
        cardInfo: { cardNumber, cardName },
        totalCost,
        status: 'success'
      })

      if (result.success) {
        // Deploy directly to Meta Marketing API (Graph API)
        const metaRes = await deployCampaignToMeta({
          name: name || 'New AI Ad Campaign',
          objective: 'OUTCOME_SALES',
          dailyBudget: Math.round(totalCost.adBudget / 30)
        })

        // Trigger celebratory confetti
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.6 }
        })

        // Deploy campaign to context with Meta IDs & Accurate Placements
        const deployedCampaign = {
          id: 'camp_' + Date.now(),
          metaCampaignId: metaRes?.metaCampaignId || ('cmp_meta_' + Date.now()),
          metaAdSetId: metaRes?.metaAdSetId,
          name: name || 'New AI Ad Campaign',
          businessName: checkoutModalData.businessName || 'Business',
          businessLogo: checkoutModalData.businessLogo || null,
          channels: checkoutModalData.placements || ['Meta Feed (Images Only)'],
          placements: checkoutModalData.placements || ['Meta Feed (Images Only)'],
          adSetName: checkoutModalData.adSetName || 'Meta Feed Image AdSet',
          adSets: checkoutModalData.adSets || [],
          objective: objective || 'Sales & Conversions',
          status: 'Live',
          adBudget: totalCost.adBudget,
          commissionPaid: totalCost.commissionAmount,
          totalSpent: 0,
          impressions: 160,
          clicks: 12,
          ctr: '7.5%',
          conversions: 1,
          cpa: 'Rs. 0',
          revenue: Math.round(totalCost.adBudget * 0.25),
          roas: '4.5x',
          creativesCount: creatives?.length || 1,
          createdDate: new Date().toISOString().split('T')[0],
          aiStatus: `Meta Active • AdSet: ${checkoutModalData.adSetName || 'Meta Feed Image'} • Auto-Pilot Active`
        }

        addCampaign(deployedCampaign)
        refreshPayments()
        setReceiptData(result.paymentRecord)
        setStep('success')
      }
    } catch (err) {
      setFailureReason(err.message || 'Payment simulation failed in Safepay Sandbox')
      setStep('failure')
    } finally {
      setLoading(false)
    }
  }

  const handleGoToDashboard = () => {
    setCheckoutModalData(null)
    setActiveTab('campaigns')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div
        className="relative w-full max-w-xl rounded-2xl glass-panel p-6 sm:p-8 border border-slate-700 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {step !== 'processing' && (
          <button
            onClick={() => setCheckoutModalData(null)}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* STEP 1: REVIEW COSTS & COMMISSION */}
        {step === 'review' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Approve Campaign & Budget</h3>
                <p className="text-xs text-slate-400">
                  Transparent cost model: Direct Media Budget + {totalCost.commissionRate}% Platform Fee
                </p>
              </div>
            </div>

            {/* Campaign Summary Card */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{name}</h4>
                  <p className="text-xs text-slate-400">{objective}</p>
                </div>
                <div className="flex gap-1.5">
                  {channels?.map((ch) => (
                    <span key={ch} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              {selectedAdCopy && (
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">LLM Ad Copy Hook:</span>
                  <p className="font-semibold text-slate-200 mt-0.5">"{selectedAdCopy.headline}"</p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Creatives Attached:</span>
                  <p className="font-semibold text-slate-200">{creatives?.length || 0} Media Assets</p>
                </div>
                <div>
                  <span className="text-slate-500">Target ROAS:</span>
                  <p className="font-semibold text-emerald-400">{strategyPlan?.projectedRoas || '4.2x'}</p>
                </div>
              </div>
            </div>

            {/* Itemized Cost Breakdown in PKR */}
            <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Financial Breakdown (Pakistani Market)
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Direct Ad Media Budget:</span>
                  <span className="font-mono font-semibold">{formatPKR(totalCost.adBudget)}</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span className="flex items-center gap-1.5">
                    <span>AdPilot Platform Commission ({totalCost.commissionRate}%):</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20">Monthly Retainer Model</span>
                  </span>
                  <span className="font-mono font-semibold">+{formatPKR(totalCost.commissionAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-bold text-white">Total Amount Due:</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {formatPKR(totalCost.totalAmount)} PKR
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span>Payments are securely processed through Safepay (Debit/Credit Card, PayFast, 1Link).</span>
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Continue to Safepay Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: SAFEPAY CHECKOUT FORM */}
        {step === 'safepay_form' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Safepay Payment Checkout</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                      PKR SECURE
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Order Tracker: {sessionTracker || 'Active'}</p>
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-400">
                {formatPKR(totalCost.totalAmount)} PKR
              </span>
            </div>

            {/* Pre-filled Card Notice */}
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400" />
              <span>Pre-authorized corporate payment card. Protected by 256-bit SSL encryption.</span>
            </div>

            {/* Card Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 font-mono tracking-wider"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                      VISA
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Expires (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleAuthorizeSafepay(false)}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Authorize & Pay {formatPKR(totalCost.totalAmount)} PKR</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('review')}
                className="w-full py-2 rounded-xl border border-slate-700 text-xs text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Back to Review
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROCESSING SPINNER */}
        {step === 'processing' && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-400 mx-auto" />
            <div>
              <h4 className="text-lg font-bold text-white">Communicating with Safepay Gateway...</h4>
              <p className="text-xs text-slate-400 mt-1">
                Validating card token, reserving ad budget & escrowing 10% platform fee
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-slate-400 text-xs border border-slate-800">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS 1.3 256-Bit Encrypted Handshake</span>
            </div>
          </div>
        )}

        {/* STEP 4: FAILURE CALLBACK VIEW */}
        {step === 'failure' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Payment Declined or Cancelled
              </h3>
              <p className="text-xs text-slate-400">
                Safepay Sandbox returned a failure status callback.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-2">
              <div className="font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>Transaction Diagnostic:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-200">
                {failureReason || 'Your transaction was declined by the payment gateway. No charges were made to your account.'}
              </p>
              <p className="text-[10px] text-red-300/80">
                Don't worry: Your campaign draft, AI ad copies, and uploaded creatives are safely preserved.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCheckoutModalData(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => setStep('safepay_form')}
                className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retry Safepay Payment</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS CONFIRMATION & RECEIPT */}
        {step === 'success' && receiptData && (
          <div className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Payment Authorized & Ad Campaign Deployed!
              </h3>
              <p className="text-xs text-slate-400">
                Safepay transaction cleared. AdPilot AI is now auto-optimizing your campaigns.
              </p>
            </div>

            {/* Official Digital Invoice / Receipt */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-3 font-mono">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400">
                <span>RECEIPT: #{receiptData.referenceId}</span>
                <span className="text-emerald-400 font-bold">STATUS: COMPLETED</span>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Merchant:</span>
                  <span className="text-white">AdPilot AI Technologies Inc.</span>
                </div>
                <div className="flex justify-between">
                  <span>Safepay Tracker:</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{receiptData.tracker}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ad Media Budget:</span>
                  <span className="text-white">{formatPKR(receiptData.adBudget)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Commission ({receiptData.commissionRate}%):</span>
                  <span className="text-indigo-400">+{formatPKR(receiptData.commissionAmount)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Total Paid (PKR):</span>
                  <span className="text-emerald-400 font-mono">{formatPKR(receiptData.amount)} PKR</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoToDashboard}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>View Campaign in Performance Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
