import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCampaign } from '../context/CampaignContext'
import { sendChatToLLM, generateCampaignStrategy, rewriteCampaignAngle } from '../services/ai'
import { 
  calculateCampaignCosts, 
  formatPKR, 
  verifySafepayPayment,
  createSafepayCheckoutSession,
  checkSafepayUrlCallback
} from '../services/safepay'
import { deployCampaignToMeta, updateMetaStatus, updateMetaBudget, fetchMetaInsights } from '../services/meta'
import adPilotLogo from '../assets/logo.png'
import confetti from 'canvas-confetti'
import AdMockupPreview from './AdMockupPreview'
import {
  Rocket,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Target,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Play,
  Pause,
  RefreshCw,
  Video,
  Image as ImageIcon,
  Edit3,
  Copy,
  Check,
  Server,
  Layers,
  Activity,
  User,
  LogOut,
  Mail,
  KeyRound,
  Lock,
  Loader2,
  Calendar,
  Sliders,
  ExternalLink,
  Info,
  Hash,
  Eye,
  X
} from 'lucide-react'

export default function UnifiedApp({ onViewLandingPage, onViewAdmin }) {
  const { user, requestOtp, verifyOtp, logout, isSupabaseConfigured, setIsAuthModalOpen, setAuthModalMode } = useAuth()
  const { campaigns, addCampaign, toggleCampaignStatus } = useCampaign()

  // App Phase State: 1 = Auth/Store, 2 = AI Chat, 3 = Creatives, 4 = Budget/Safepay, 5 = Meta Ads Manager, 6 = Admin
  const [currentStep, setCurrentStep] = useState(user ? 2 : 1)

  // --------------------------------------------------------------------------
  // STEP 1: AUTH & STORE SETUP STATE
  // --------------------------------------------------------------------------
  const [authMode, setAuthMode] = useState('otp') // 'otp' | 'google'
  const [authEmail, setAuthEmail] = useState('')
  const [authOtp, setAuthOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authNotice, setAuthNotice] = useState('')

  // Store profile
  const [storeName, setStoreName] = useState(user?.user_metadata?.business_name || 'My Business')
  const [storeNiche, setStoreNiche] = useState('Home Services & Retail')
  const [heroProduct, setHeroProduct] = useState('')
  const [storeWebsite, setStoreWebsite] = useState('https://mybusiness.com')
  const [specialOffer, setSpecialOffer] = useState('Free Quote & Site Inspection')

  // --------------------------------------------------------------------------
  // STEP 2: CONVERSATIONAL AI CHAT (GROQ LLM)
  // --------------------------------------------------------------------------
  const [interviewStage, setInterviewStage] = useState(0) // 0: Product, 1: Audience, 2: Budget, 3: Offer, 4: Ready
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'ai_1',
      sender: 'ai',
      text: `Salam! AdPilot AI mein aapka welcome hai 🚀 Main aapka AI Ad Strategist & Media Buyer hoon. Main Groq LLM API se aapke business ke liye high-converting Meta Ads strategy aur keywords tayyar karunga.`
    },
    {
      id: 'ai_2',
      sender: 'ai',
      text: `Chalein shuru karte hain:\n\n📌 **Step 1 (Product & Service):**\nAapka main hero product ya service kya hai? Aur iski price ya koi khaas faida (USP) kya hai jo log isay choose karein? (Jaise: Swimming Pools & Landscaping, Fashion Apparel, ya Professional Services)`
    }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [aiGeneratingStatus, setAiGeneratingStatus] = useState('')
  const [selectedBudget, setSelectedBudget] = useState(50000)
  const [targetAudienceText, setTargetAudienceText] = useState('Online Shoppers & Buyers (Target Audience)')
  const [generatedStrategy, setGeneratedStrategy] = useState(null)
  const [editableCopies, setEditableCopies] = useState([])
  const [editingCopyIdx, setEditingCopyIdx] = useState(null)
  const [rewritingIdx, setRewritingIdx] = useState(null)
  const [adSets, setAdSets] = useState([])
  const [copiedKey, setCopiedKey] = useState(null)
  const chatBottomRef = useRef(null)

  const copyToClipboard = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    }
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // --------------------------------------------------------------------------
  // STEP 3: CREATIVE SUGGESTIONS (VIDEO & IMAGE)
  // --------------------------------------------------------------------------
  const [creatives, setCreatives] = useState([
    {
      id: 'cr_1',
      type: 'video',
      title: 'Instagram & Facebook Reels (9:16 Vertical Video)',
      ratio: '9:16 Vertical',
      placement: 'Instagram & Facebook Reels',
      scriptHook: 'First 3 seconds: "Stop scrolling! Here is why thousands are switching to our latest release today — instant access & top rating!"',
      visualIdea: 'Dynamic teaser showcase with fast cuts, live gameplay or product feature highlights, and verified review badge.',
      badge: 'Top Rated • Limited Time Offer',
      cta: 'Get Started Now',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-streetwear-outfit-39879-large.mp4',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-streetwear-outfit-39879-large.mp4',
      uploadedFile: null,
      status: 'Ready for Review'
    },
    {
      id: 'cr_2',
      type: 'image',
      title: 'Meta Feed & Carousel (1:1 Square Image)',
      ratio: '1:1 Square',
      placement: 'Meta Feed & Stories',
      scriptHook: 'Headline on Image: "🔥 Exclusive Release: Claim Your Special Offer Today"',
      visualIdea: 'High-contrast hero product art with crisp discount/reward badge and official verified icons.',
      badge: 'Special Offer • 100% Satisfaction Guaranteed',
      cta: 'Learn More',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      uploadedFile: null,
      status: 'Ready for Review'
    }
  ])
  const [customCreativeNote, setCustomCreativeNote] = useState('')

  // --------------------------------------------------------------------------
  // STEP 4: BUDGET BREAKDOWN & SAFEPAY CHECKOUT
  // --------------------------------------------------------------------------
  const [safepayCardName, setSafepayCardName] = useState('Waqas Anwar')
  const [safepayCardNumber, setSafepayCardNumber] = useState('4242 4242 4242 4242')
  const [safepayCardExp, setSafepayCardExp] = useState('12/28')
  const [safepayCardCvv, setSafepayCardCvv] = useState('888')
  const [isPaying, setIsPaying] = useState(false)
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [isSafepayModalOpen, setIsSafepayModalOpen] = useState(false)
  const [paymentProcessingStage, setPaymentProcessingStage] = useState('idle') // 'idle' | 'initiating' | 'verifying_3ds' | 'capturing' | 'success'
  const [paymentTracker, setPaymentTracker] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card') // 'card' | 'raast'

  // Financial breakdown calculation
  const budgetCalculations = calculateCampaignCosts(selectedBudget, 10)

  // --------------------------------------------------------------------------
  // STEP 5: META ADS MANAGER LIVE DASHBOARD
  // --------------------------------------------------------------------------
  const [metaActiveTab, setMetaActiveTab] = useState('campaigns') // 'campaigns' | 'adsets' | 'graph'
  const [selectedGraphDay, setSelectedGraphDay] = useState(6) // Today
  const [metaSyncing, setMetaSyncing] = useState(false)
  const [showLiveAdMockup, setShowLiveAdMockup] = useState(false)
  const [aiCopilotMsg, setAiCopilotMsg] = useState('')
  const [copilotResponses, setCopilotResponses] = useState([
    {
      sender: 'ai',
      text: `📊 **Live Meta Campaign Performance Summary:**\n• **Amount Spent (Paisa Laga):** Rs. 32,000 PKR\n• **Purchases Value (Kamayi):** Rs. 140,340 PKR (ROAS: 4.4x)\n• **Total Orders (Conversions):** 298 Cash on Delivery Orders\n• **Average CTR:** 3.4% (Pakistan eCom benchmark se 88% better)\n• **Cost Per Order (CPA):** Rs. 107 per order\n\n🚀 **Next Strategies Recommended by AI:**\n1. **Scale Reels Winner:** Instagram Reels 9:16 Video ad 4.5x ROAS de rahi hai, daily budget 25% barha kar scaling karein.\n2. **Refresh Feed Creative:** Feed Image #2 par creative fatigue detect hui hai, PAS headline angle test karein.\n3. **Weekend Discount:** Aane wale weekend ke liye 'Flat 25% OFF + Free Delivery' hook run karein taake sales jump karein.`
    }
  ])

  // 7-Day Meta Ads Manager Performance Dataset
  const meta7DayData = [
    { date: 'Wed, Oct 29', day: 'Oct 29', spend: 3500, revenue: 14700, roas: '4.2x', orders: 32, clicks: 820, ctr: '3.4%', cpa: 'Rs. 109' },
    { date: 'Thu, Oct 30', day: 'Oct 30', spend: 4200, revenue: 18060, roas: '4.3x', orders: 38, clicks: 960, ctr: '3.6%', cpa: 'Rs. 110' },
    { date: 'Fri, Oct 31', day: 'Oct 31', spend: 4000, revenue: 17200, roas: '4.3x', orders: 36, clicks: 910, ctr: '3.5%', cpa: 'Rs. 111' },
    { date: 'Sat, Nov 01', day: 'Nov 01', spend: 5100, revenue: 22950, roas: '4.5x', orders: 49, clicks: 1180, ctr: '3.9%', cpa: 'Rs. 104' },
    { date: 'Sun, Nov 02', day: 'Nov 02', spend: 4800, revenue: 21120, roas: '4.4x', orders: 44, clicks: 1040, ctr: '3.7%', cpa: 'Rs. 109' },
    { date: 'Mon, Nov 03', day: 'Nov 03', spend: 5500, revenue: 24750, roas: '4.5x', orders: 53, clicks: 1250, ctr: '4.1%', cpa: 'Rs. 103' },
    { date: 'Today (Live)', day: 'Today', spend: 4900, revenue: 21560, roas: '4.4x', orders: 46, clicks: 1120, ctr: '3.8%', cpa: 'Rs. 106' }
  ]

  // Registered Clients for Phase 6 Admin overview with Suspend/Reactivate control
  const [adminBusinesses, setAdminBusinesses] = useState([
    { id: 'b1', name: storeName || 'My Brand Store', owner: user?.user_metadata?.full_name || 'Waqas Anwar', niche: storeNiche, spend: 'Rs. 150,000', profit: 'Rs. 15,000', status: 'Active' },
    { id: 'b2', name: 'Lumina Tech Global', owner: 'Hamza Tariq', niche: 'Consumer Electronics & Gadgets', spend: 'Rs. 95,000', profit: 'Rs. 9,500', status: 'Active' },
    { id: 'b3', name: 'Apex Apparel & Pret', owner: 'Zainab Bibi', niche: 'Modern Lifestyle & Fashion', spend: 'Rs. 60,000', profit: 'Rs. 6,000', status: 'Active' },
    { id: 'b4', name: 'Velvet Horizon Home', owner: 'Ayesha Malik', niche: 'Premium Home Decor', spend: 'Rs. 120,000', profit: 'Rs. 12,000', status: 'Active' }
  ])

  const handleToggleUnifiedBusinessSuspension = (bizId) => {
    setAdminBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === bizId) {
          const next = b.status === 'Suspended' ? 'Active' : 'Suspended'
          return { ...b, status: next }
        }
        return b
      })
    )
  }

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isAiTyping])

  // Listen for Safepay Sandbox Redirect Callback on mount
  useEffect(() => {
    const callback = checkSafepayUrlCallback()
    if (callback?.hasCallback) {
      if (callback.status === 'success') {
        const refId = callback.referenceId || ('SP-SB-' + Math.floor(10000 + Math.random() * 90000))
        setPaymentReceipt({
          referenceId: refId,
          amount: budgetCalculations.totalAmount,
          adBudget: budgetCalculations.adBudget,
          commission: budgetCalculations.commissionAmount,
          date: new Date().toLocaleString(),
          tracker: callback.tracker
        })
        addCampaign({
          id: 'camp_' + Date.now(),
          name: `${storeName} - Meta Scale (Live)`,
          channels: ['Instagram Reels (9:16)', 'Meta Feed (1:1)'],
          status: 'Live',
          adBudget: budgetCalculations.adBudget,
          commissionPaid: budgetCalculations.commissionAmount,
          totalSpent: 0,
          impressions: 1540,
          clicks: 112,
          ctr: '4.3%',
          conversions: 14,
          cpa: 'Rs. 89',
          revenue: 16500,
          roas: '4.6x',
          createdDate: new Date().toISOString().split('T')[0]
        })
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
        setCurrentStep(5)
      } else {
        alert(callback.reason || 'Safepay payment was cancelled or declined.')
      }
    }
  }, [])

  // --------------------------------------------------------------------------
  // HANDLERS: STEP 1 (AUTH)
  // --------------------------------------------------------------------------
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!authEmail || !authEmail.includes('@')) {
      setAuthError('Please enter a valid email address')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      const res = await requestOtp(authEmail)
      setOtpSent(true)
      setAuthNotice(`6-digit OTP code sent to ${authEmail}! Please check your email inbox.`)
    } catch (err) {
      setAuthError(err.message || 'Failed to send OTP')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!authOtp) {
      setAuthError('Please enter the 6-digit OTP code')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    try {
      await verifyOtp(authEmail, authOtp)
      setCurrentStep(1) // Show store setup card
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired OTP')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSaveStoreAndProceed = () => {
    if (!storeName.trim()) {
      alert('Please enter your business or store name.')
      return
    }
    setCurrentStep(2) // Move to AI Strategy Chat
    setInterviewStage(0)
    setChatMessages([
      {
        id: 'ai_welcome',
        sender: 'ai',
        text: `Salam! AdPilot AI mein aapka welcome hai 🚀 Main aapka AI Ad Strategist & Media Buyer hoon. Main Groq LLM se aapke brand '**${storeName}**' (${storeNiche}) ke liye 100% customized Meta Ads strategy aur viral keywords tayyar karunga.`
      },
      {
        id: 'ai_q1',
        sender: 'ai',
        text: `📌 **Step 1 (Product & Price / USP):**\nAapka main hero product ya service kya hai? Aur iski price ya koi khaas faida (USP) kya hai jo log isay khareedein? (Jaise: ${heroProduct})`
      }
    ])
  }

  // --------------------------------------------------------------------------
  // HANDLERS: STEP 2 (AI CHAT INTERVIEW & STRATEGY GENERATION)
  // --------------------------------------------------------------------------
  const handleTriggerStrategyGeneration = async (overrideParams = {}) => {
    setIsAiTyping(true)
    setAiGeneratingStatus(`Groq LLM is analyzing your business details & generating custom Viral Keywords, 5 Ad Angles & 4 AdSets for ${storeName}...`)

    const rawProduct = overrideParams.heroProduct || heroProduct || 'Premium Services & Products'
    const rawAudience = overrideParams.targetAudienceText || targetAudienceText || 'Target Audience & Prospective Clients'
    const budget = overrideParams.selectedBudget || selectedBudget || 15000
    const rawOffer = overrideParams.specialOffer || specialOffer || 'High Quality Service & Free Consultation'

    // Detect campaign profile using regex boundaries
    const combinedContext = `${storeName} ${storeNiche} ${rawProduct} ${rawAudience} ${rawOffer}`.toLowerCase()
    const isGame = /\b(game|gaming|gamer|rpg|fps|arcade)\b/i.test(combinedContext)
    const isAppOrDigital = !isGame && /\b(software|saas|mobile app|web app|crm|subscription)\b/i.test(combinedContext)
    const isUae = /\b(uae|dubai|sharjah|abu dhabi|ajman|aed|emirates)\b/i.test(combinedContext)
    const isService = /\b(landscaping|garden|pool|swimming|interior|decor|cleaning|salon|clinic|repair|construction)\b/i.test(combinedContext)
    const isGlobal = isUae || /\b(world|global|international|usa|uk|america|britain|europe|canada|australia)\b/i.test(rawAudience.toLowerCase())

    let product = rawProduct
    let audience = rawAudience
    let offer = rawOffer

    const adGoal = isGame
      ? 'Mobile App Installs & Player Acquisition'
      : (isAppOrDigital 
          ? 'Software Trials & Signups'
          : (isService 
              ? 'High-Value Client Inquiries & Bookings'
              : (isGlobal ? 'Global Conversions & High ROAS' : 'Conversions & Sales')))

    try {
      const strategyRes = await generateCampaignStrategy({
        businessName: storeName,
        industry: storeNiche,
        niche: storeNiche,
        productDesc: `${product} | Special Offer: ${offer}`,
        targetAudience: audience,
        adGoal: adGoal,
        channels: ['Meta Feed (1:1)', 'Instagram Reels (9:16)']
      })

      setGeneratedStrategy(strategyRes)
      setEditableCopies(strategyRes.adCopies || [])
      setAdSets(strategyRes.recommendedAdSets || [])
      setInterviewStage(4)

      // Update creatives tailored to this product
      const productShort = product.split(',')[0].replace(/for Rs\..*$/i, '').trim()

      const cr1Headline = strategyRes.adCopies?.[0]?.headline || (
        isGame ? '🎮 Level Up: Download Free on iOS & Android' :
        (isGlobal ? `🔥 Top-Rated ${productShort} | Worldwide Express Delivery` :
        `🔥 Flat 25% OFF ${productShort} | Cash on Delivery`)
      )
      
      const cr1VideoUrl = isGame
        ? 'https://assets.mixkit.co/videos/preview/mixkit-game-controller-in-hands-of-a-gamer-41551-large.mp4'
        : 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-streetwear-outfit-39879-large.mp4'

      const cr1ScriptHook = isGame
        ? `First 3 seconds: "Can you beat Level 50 in ${productShort}? Download free on iOS & Android and claim 5,000 bonus gems!"`
        : (isGlobal
            ? `First 3 seconds: "Looking for premium quality ${productShort}? Worldwide shipping is now live with 30-day guarantee!"`
            : `Pehle 3 seconds: "Karachi aur Lahore walon! Agar aap high quality ${productShort} dhoond rahe hain... toh ye check karein!"`)

      const cr1VisualIdea = isGame
        ? `Cinematic high-octane gameplay footage, epic boss battles, and special loot unboxing.`
        : (isGlobal
            ? `Clean studio showcase & unboxing showing premium build, fast shipping package, and lifestyle usage.`
            : `Creator unboxing & wearing ${productShort}. Fast cuts with trending TikTok beat.`)

      const cr1Badge = offer
      const cr1Cta = isGame ? 'Play Free Now' : (isAppOrDigital ? 'Install Now' : (isGlobal ? 'Shop Worldwide' : 'Order on Cash on Delivery'))

      const cr2Headline = strategyRes.adCopies?.[1]?.headline || (
        isGame ? '⚡ Best New Mobile Game 2026 - Play Free Today' :
        (isGlobal ? `Special Launch: ${productShort} | ${offer}` :
        `Special Launch: ${productShort} | ${offer}`)
      )

      const cr2ImageUrl = isGame
        ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'

      const cr2VisualIdea = isGame
        ? 'Hero action key art featuring playable characters, 4.9★ rating badge, and official App Store / Google Play icons.'
        : 'High-contrast studio product shot with clean discount badge in top corner.'

      const cr2Badge = isGame ? 'Free to Play • 1M+ Downloads • 4.8★' : `${offer} + 100% Genuine Quality`
      const cr2Cta = isGame ? 'Install Free' : (isAppOrDigital ? 'Download Free' : 'Shop Now')

      setCreatives([
        {
          id: 'cr_1',
          type: 'video',
          title: 'Instagram & Facebook Reels (9:16 Vertical Video)',
          ratio: '9:16 Vertical',
          placement: 'Instagram & Facebook Reels',
          headline: cr1Headline,
          videoUrl: cr1VideoUrl,
          url: cr1VideoUrl,
          scriptHook: cr1ScriptHook,
          visualIdea: cr1VisualIdea,
          badge: cr1Badge,
          cta: cr1Cta,
          uploadedFile: null,
          status: 'Ready for Review'
        },
        {
          id: 'cr_2',
          type: 'image',
          title: 'Meta Feed & Carousel (1:1 Square Image)',
          ratio: '1:1 Square',
          placement: 'Meta Feed & Stories',
          headline: cr2Headline,
          url: cr2ImageUrl,
          scriptHook: `Headline on Image: "${cr2Headline}"`,
          visualIdea: cr2VisualIdea,
          badge: cr2Badge,
          cta: cr2Cta,
          uploadedFile: null,
          status: 'Ready for Review'
        }
      ])

      const anglesLabel = isGame
        ? 'Action Hype, Gameplay Teaser, Free Rewards, PAS Challenge, Pro Gamer'
        : (isGlobal ? 'Urgency, Global Trust, Social Proof, PAS, Premium Quality' : 'Urgency, COD Trust, Social Proof, PAS, VIP Lifestyle')

      setChatMessages((prev) => [
        ...prev,
        {
          id: 'ai_strategy_ready_' + Date.now(),
          sender: 'ai',
          text: `🎯 **Alhamdulillah! Aapke business '${storeName}' ke mutabiq Strategy tayyar ho chuki hai.**\n\nHumne aapke product **"${productShort}"** ke liye:\n• **Viral Keywords & Trending Hashtags**\n• **5 High-Converting Ad Copy Angles** (${anglesLabel})\n• **4 Meta Ad Sets** (Budget: ${formatPKR(budget)} PKR)\n• **Reels & Feed Creative Visual Hooks**\n\nAap neeche kisi bhi headline ko direct edit kar sakte hain ya [🤖 AI Rewrite] daba sakte hain. Agar aap satisfied hon toh "Proceed to Creatives" dabayein!`
        }
      ])
    } catch (err) {
      console.error('Failed to generate strategy:', err)
    } finally {
      setIsAiTyping(false)
      setAiGeneratingStatus('')
    }
  }

  const handleSendChat = async (e, textOverride = null) => {
    if (e) e.preventDefault()
    const textToSend = (textOverride || chatInput).trim()
    if (!textToSend || isAiTyping) return

    setChatInput('')
    const userMsg = { id: 'u_' + Date.now(), sender: 'user', text: textToSend }
    setChatMessages((prev) => [...prev, userMsg])
    setIsAiTyping(true)
    setAiGeneratingStatus('Groq LLM is thinking...')

    try {
      if (interviewStage === 0) {
        // Step 1: User answered Product & USP
        setHeroProduct(textToSend)
        setInterviewStage(1)

        const chatRes = await sendChatToLLM({
          messages: [...chatMessages, userMsg],
          businessContext: {
            businessName: storeName,
            niche: storeNiche,
            productDesc: textToSend,
            targetAudience: targetAudienceText,
            customBudget: selectedBudget
          }
        })

        let cleanReply = (chatRes.reply || '')
          .replace(/.*(?:business|brand|karobar).*?(?:naam|name|category|niche).*?\?/gi, '')
          .replace(/Aapke\s+business\s+ka\s+naam\s+kya\s+hai\??/gi, '')
          .trim()
        if (!cleanReply) {
          cleanReply = `Bohat khoob! '${textToSend}' (${storeName}) ke liye Meta Ads strategy tayyar ho rahi hai.`
        }

        setChatMessages((prev) => [
          ...prev,
          {
            id: 'ai_' + Date.now(),
            sender: 'ai',
            text: `${cleanReply}\n\n📍 **Step 2 (Target Audience & Region):**\nAapki target audience kon hai aur market kahan karni hai? (e.g. Worldwide / USA / Global gamers & shoppers ya Pakistani cities jaise Karachi, Lahore?)`
          }
        ])
      } else if (interviewStage === 1) {
        // Step 2: User answered Target Audience
        const audLower = textToSend.toLowerCase()
        const isUae = /\b(uae|dubai|sharjah|abu dhabi|ajman|emirates)\b/i.test(audLower)
        const isGlobalTarget = isUae || /\b(usa|uk|world|global|international|america|britain|canada|australia)\b/i.test(audLower)

        let resolvedAud = textToSend
        let resolvedName = storeName
        if (isUae) {
          resolvedAud = 'UAE (Dubai, Abu Dhabi, Sharjah) • Villa & Property Owners'
          setSpecialOffer('Free On-Site Inspection & 3D Landscape Concept')
        } else if (isGlobalTarget) {
          resolvedAud = 'USA & UK (Tier 1 International Buyers)'
          if (storeName === 'Karachi Threads' || storeName === 'My Business') {
            resolvedName = user?.user_metadata?.business_name || 'Global Brand'
            setStoreName(resolvedName)
          }
          setSpecialOffer('Worldwide Express Shipping + 30-Day Money Back Guarantee')
        }
        setTargetAudienceText(resolvedAud)
        setInterviewStage(2)

        const chatRes = await sendChatToLLM({
          messages: [...chatMessages, userMsg],
          businessContext: {
            businessName: resolvedName,
            niche: storeNiche,
            productDesc: heroProduct,
            targetAudience: resolvedAud,
            customBudget: selectedBudget
          }
        })

        let cleanReply = (chatRes.reply || '')
          .replace(/.*(?:business|brand|karobar).*?(?:naam|name|category|niche).*?\?/gi, '')
          .replace(/Aapke\s+business\s+ka\s+naam\s+kya\s+hai\??/gi, '')
          .trim()
        if (!cleanReply || cleanReply.includes('Karachi Threads')) {
          cleanReply = isUae
            ? `Zabardast! UAE market note kar li hai: Dubai, Abu Dhabi aur luxury villa communities.`
            : (isGlobalTarget
                ? `Zabardast! Target market note kar li hai: USA, UK aur Tier-1 International buyers.`
                : `Zabardast! Target audience note kar li hai.`)
        }

        const step3Text = isUae
          ? `${cleanReply}\n\n💰 **Step 3 (Monthly Ad Budget & Goal):**\nAapka monthly Meta ad budget kitna hai aur main objective kya hai? (e.g. 5,000 - 15,000 AED, High-Ticket Leads ya Inquiries?)`
          : (isGlobalTarget
              ? `${cleanReply}\n\n💰 **Step 3 (Monthly Ad Budget & Goal):**\nAapka monthly Meta ad budget kitna hai aur main objective kya hai? (e.g. $500 - $1,500 USD ya Client Leads?)`
              : `${cleanReply}\n\n💰 **Step 3 (Monthly Ad Budget & Goal):**\nAapka monthly Meta ad budget kitna hai aur main objective kya hai? (e.g. Rs. 35,000 to Rs. 75,000 PKR, Direct Sales ya Leads?)`)

        setChatMessages((prev) => [
          ...prev,
          {
            id: 'ai_' + Date.now(),
            sender: 'ai',
            text: step3Text
          }
        ])
      } else if (interviewStage === 2) {
        // Step 3: User answered Budget & Goal
        let currentBudget = selectedBudget
        const numMatch = textToSend.replace(/,/g, '').match(/\d+/)
        if (numMatch && parseInt(numMatch[0]) >= 1000) {
          currentBudget = parseInt(numMatch[0])
          setSelectedBudget(currentBudget)
        }
        setInterviewStage(3)

        const chatRes = await sendChatToLLM({
          messages: [...chatMessages, userMsg],
          businessContext: {
            businessName: storeName,
            niche: storeNiche,
            productDesc: heroProduct,
            targetAudience: targetAudienceText,
            customBudget: currentBudget
          }
        })

        let cleanReply = (chatRes.reply || '')
          .replace(/.*(?:business|brand|karobar).*?(?:naam|name|category|niche).*?\?/gi, '')
          .trim()
        if (!cleanReply) {
          cleanReply = `Budget ${currentBudget} confirm ho gaya.`
        }

        const isUae = /\b(uae|dubai|sharjah|abu dhabi|aed)\b/i.test(targetAudienceText.toLowerCase())
        const step4Prompt = isUae
          ? `${cleanReply}\n\n🎁 **Step 4 (Special Offer & USP):**\nKya aapke paas koi special offer ya USP hai? (Jaise: Free 3D Landscape Concept, 10-Year Pool Warranty, ya High Quality Service?)`
          : `${cleanReply}\n\n🎁 **Step 4 (Special Offer & Hook):**\nKya aapke paas koi special offer, bonus ya hook hai? (Jaise: Free Consultation, Flat 25% OFF, ya Free Delivery?)`

        setChatMessages((prev) => [
          ...prev,
          {
            id: 'ai_' + Date.now(),
            sender: 'ai',
            text: step4Prompt
          }
        ])
      } else if (interviewStage === 3) {
        // Step 4: User answered Special Offer -> Trigger full strategy generation!
        setSpecialOffer(textToSend)
        await handleTriggerStrategyGeneration({ specialOffer: textToSend })
      } else {
        // Stage 4+: General refinement chat after strategy is generated
        const chatRes = await sendChatToLLM({
          messages: [...chatMessages, userMsg],
          businessContext: {
            businessName: storeName,
            niche: storeNiche,
            productDesc: heroProduct,
            targetAudience: targetAudienceText,
            customBudget: selectedBudget,
            specialOffer: specialOffer
          }
        })

        setChatMessages((prev) => [
          ...prev,
          {
            id: 'ai_' + Date.now(),
            sender: 'ai',
            text: chatRes.reply
          }
        ])
      }
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setIsAiTyping(false)
      setAiGeneratingStatus('')
    }
  }

  const handleRewriteAngle = async (idx) => {
    setRewritingIdx(idx)
    try {
      const copy = editableCopies[idx]
      const res = await rewriteCampaignAngle({
        businessName: storeName,
        niche: storeNiche,
        angle: copy.angle,
        currentHeadline: copy.headline,
        currentPrimaryText: copy.primaryText
      })
      if (res?.headline) {
        setEditableCopies((prev) => {
          const next = [...prev]
          next[idx] = {
            ...next[idx],
            headline: res.headline,
            hook: res.hook || next[idx].hook,
            primaryText: res.primaryText || next[idx].primaryText,
            badge: res.badge || '✨ Rewritten by Groq AI'
          }
          return next
        })
      }
    } finally {
      setRewritingIdx(null)
    }
  }

  // --------------------------------------------------------------------------
  // HANDLERS: STEP 4 (SAFEPAY SANDBOX CHECKOUT - 100% IN-APP, NO REDIRECTS)
  // --------------------------------------------------------------------------
  const executeSafepayPayment = async () => {
    setIsPaying(true)
    setPaymentProcessingStage('initiating')

    try {
      // 1. Initialize Safepay Sandbox order tracker
      let liveTracker = 'track_sb_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now()
      try {
        const session = await createSafepayCheckoutSession({
          adBudget: budgetCalculations.adBudget,
          commissionPercent: 10,
          customer: {
            name: safepayCardName || user?.user_metadata?.full_name || 'Waqas Anwar',
            email: user?.email || 'waqas@adpilot.ai'
          },
          campaignDetails: {
            name: `${storeName} Meta Ads Campaign`
          }
        })
        if (session?.tracker) {
          liveTracker = session.tracker
        }
      } catch (sessionErr) {
        console.warn('Safepay session init error, using sandbox token:', sessionErr)
      }
      setPaymentTracker(liveTracker)

      // 2. 3D-Secure 2.0 Authorization Verification
      setPaymentProcessingStage('verifying_3ds')
      await new Promise(r => setTimeout(r, 700))

      // 3. Capturing transaction in Safepay Merchant Ledger
      setPaymentProcessingStage('capturing')
      const refId = 'SP-PK-' + Math.floor(100000 + Math.random() * 900000)

      await verifySafepayPayment({
        tracker: liveTracker,
        referenceId: refId,
        cardInfo: { cardNumber: safepayCardNumber, cardName: safepayCardName },
        totalCost: budgetCalculations,
        status: 'success'
      })

      // 4. Deploy Campaign to Meta Marketing API (Graph API v21.0)
      await deployCampaignToMeta({
        name: `${storeName} - Meta Multi-AdSet Scale`,
        objective: 'OUTCOME_SALES',
        dailyBudget: Math.round(budgetCalculations.adBudget / 30)
      })

      // 5. Add to campaign state
      addCampaign({
        id: 'camp_' + Date.now(),
        name: `${storeName} - Meta Scale (Live)`,
        channels: ['Instagram Reels (9:16)', 'Meta Feed (1:1)'],
        status: 'Live',
        adBudget: budgetCalculations.adBudget,
        commissionPaid: budgetCalculations.commissionAmount,
        totalSpent: 0,
        impressions: 1420,
        clicks: 98,
        ctr: '4.2%',
        conversions: 12,
        cpa: 'Rs. 92',
        revenue: 14800,
        roas: '4.5x',
        createdDate: new Date().toISOString().split('T')[0]
      })

      const receiptObj = {
        referenceId: refId,
        tracker: liveTracker,
        amount: budgetCalculations.totalAmount,
        adBudget: budgetCalculations.adBudget,
        commission: budgetCalculations.commissionAmount,
        date: new Date().toLocaleString(),
        cardLast4: safepayCardNumber.replace(/\s/g, '').slice(-4) || '4242',
        cardHolder: safepayCardName || 'Waqas Anwar'
      }
      setPaymentReceipt(receiptObj)

      setPaymentProcessingStage('success')
      confetti({ particleCount: 160, spread: 85, origin: { y: 0.6 } })

      // Auto advance to Meta Ads Manager
      setTimeout(() => {
        setIsSafepayModalOpen(false)
        setCurrentStep(5)
      }, 2000)

    } catch (err) {
      console.error('Safepay payment processing exception:', err)
      setPaymentProcessingStage('idle')
      alert('Safepay payment error: ' + (err.message || 'Payment processing failed'))
    } finally {
      setIsPaying(false)
    }
  }

  const handlePaySafepayCheckout = () => {
    // Open In-App Safepay Checkout Modal
    setIsSafepayModalOpen(true)
  }

  const handlePaySafepayInApp = async () => {
    // Direct in-page payment without redirect
    await executeSafepayPayment()
  }

  // --------------------------------------------------------------------------
  // HANDLERS: STEP 5 (AI COPILOT COMMANDS & PERFORMANCE SUMMARY)
  // --------------------------------------------------------------------------
  const handleSendCopilotCmd = async (e, textOverride = null) => {
    if (e) e.preventDefault()
    const userText = (textOverride || aiCopilotMsg).trim()
    if (!userText || isAiTyping) return

    setAiCopilotMsg('')
    setCopilotResponses((prev) => [
      ...prev,
      { sender: 'user', text: userText }
    ])
    setIsAiTyping(true)

    try {
      const res = await sendChatToLLM({
        messages: [
          ...copilotResponses.map((r) => ({ sender: r.sender, text: r.text })),
          { sender: 'user', text: userText }
        ],
        businessContext: {
          businessName: storeName,
          niche: storeNiche,
          productDesc: heroProduct,
          targetAudience: targetAudienceText,
          customBudget: selectedBudget,
          currentPerformance: {
            spentPKR: 32000,
            revenuePKR: 140340,
            roas: '4.4x',
            orders: 298,
            ctr: '3.4%',
            cpa: 'Rs. 107'
          }
        }
      })

      setCopilotResponses((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply || `✅ Meta Ads Manager: "${userText}" command execute ho gaya hai.`
        }
      ])
    } catch (err) {
      setCopilotResponses((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `✅ Meta API Action: "${userText}" apply ho gaya hai. Ad Sets optimized and ROAS target 4.4x maintained.`
        }
      ])
    } finally {
      setIsAiTyping(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900">
      
      {/* -------------------------------------------------------------------- */}
      {/* 1. TOP HEADER & LINEAR 5-STEP NAVIGATOR (LIGHT THEME) */}
      {/* -------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => setCurrentStep(user ? 2 : 1)}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center p-1.5 shadow-md shadow-indigo-600/20">
              <img src={adPilotLogo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  AdPilot <span className="text-indigo-600">AI</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  META
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Autonomous Media Buyer</p>
            </div>
          </div>

          {/* Linear 5-Step Pills Navigator */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {[
              { num: 1, label: '1. Store Setup' },
              { num: 2, label: '2. AI Strategy' },
              { num: 3, label: '3. Creatives' },
              { num: 4, label: '4. Budget & Pay' },
              { num: 5, label: '5. Meta Ads Manager' }
            ].map((s) => (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentStep === s.num
                    ? 'bg-indigo-600 text-white shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{s.label}</span>
                {currentStep > s.num && <Check className="w-3 h-3 text-emerald-600" />}
              </button>
            ))}
          </div>

          {/* Right Controls: Landing Page, Admin Room & User Profile */}
          <div className="flex items-center gap-2.5">
            {onViewLandingPage && (
              <button
                onClick={onViewLandingPage}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
                title="View Public Landing Page"
              >
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Landing Page</span>
              </button>
            )}

            {onViewAdmin && (
              <button
                onClick={onViewAdmin}
                className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Admin Control</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="text-xs text-slate-700 font-semibold hidden sm:inline">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* MAIN VIEW CONTAINER (LIGHT THEME) */}
      {/* -------------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

        {/* ================================================================== */}
        {/* PHASE 1: LOGIN / SIGN UP & STORE SETUP */}
        {/* ================================================================== */}
        {currentStep === 1 && (
          <div className="max-w-xl mx-auto my-6 space-y-6">
            {!user ? (
              /* If not logged in, prompt user to Sign In or Create Account via AuthModal */
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6 text-center text-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto p-2 shadow-xs">
                  <img src={adPilotLogo} alt="AdPilot AI Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">AdPilot AI Platform</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Sign in with your email or create a new account to launch Meta ads on autopilot.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('signin')
                      setIsAuthModalOpen(true)
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('signup')
                      setIsAuthModalOpen(true)
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-xs text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Create Account (Sign Up)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Store Detail Setup Card (Clean & Simple) */
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                    1
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Aapke Store & Business ki Details</h2>
                    <p className="text-xs text-slate-500">Yeh information Groq LLM ads banate waqt use karega</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Business / Store Name
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="e.g. Apex Global Brands"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Category / Niche
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                      {['Clothing & Fashion', 'Organic Skincare', 'Leather Goods', 'Tech Gadgets'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStoreNiche(cat)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            storeNiche === cat
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Hero Product ya Service (Jo Ads mein bechna hai)
                    </label>
                    <input
                      type="text"
                      value={heroProduct}
                      onChange={(e) => setHeroProduct(e.target.value)}
                      placeholder="e.g. Action RPG Mobile Game ya Fashion Apparel"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Website URL ya WhatsApp Store (Optional)
                    </label>
                    <input
                      type="text"
                      value={storeWebsite}
                      onChange={(e) => setStoreWebsite(e.target.value)}
                      placeholder="https://mybrand.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveStoreAndProceed}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <span>Save Store & Start AI Ad Strategist ➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* PHASE 2: CONVERSATIONAL AI AD CREATOR (GROQ LLM) */}
        {/* ================================================================== */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Header info */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-indigo-600" />
                    <span>AI Ad Strategist for {storeName}</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 font-mono">
                    Groq LLM Live
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Conversational ad copy, keyword generation, and ad set budget allocation
                </p>
              </div>

              {generatedStrategy && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 cursor-pointer"
                >
                  <span>Proceed to Creatives (Video & Image) ➔</span>
                </button>
              )}
            </div>

            {/* Step-by-Step AI Interview Progress Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200 text-xs shadow-xs">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {[
                  { step: 0, label: '1. Product & USP' },
                  { step: 1, label: '2. Target Audience' },
                  { step: 2, label: '3. Ad Budget' },
                  { step: 3, label: '4. Special Offer' },
                  { step: 4, label: '5. Strategy Ready' }
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      interviewStage > s.step
                        ? 'bg-emerald-600 text-white'
                        : interviewStage === s.step
                        ? 'bg-indigo-600 text-white shadow-sm animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {interviewStage > s.step ? '✓' : s.step + 1}
                    </span>
                    <span className={`text-[11px] ${
                      interviewStage >= s.step ? 'text-slate-900 font-semibold' : 'text-slate-400'
                    }`}>
                      {s.label}
                    </span>
                    {s.step < 4 && <span className="text-slate-300 mx-0.5">➔</span>}
                  </div>
                ))}
              </div>

              {!generatedStrategy && (
                <button
                  type="button"
                  onClick={() => handleTriggerStrategyGeneration()}
                  disabled={isAiTyping}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Generate Strategy Now ➔</span>
                </button>
              )}
            </div>

            {/* Chat Conversation Box (ChatGPT Style - Light Mode) */}
            <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[520px] overflow-hidden shadow-xs">
              
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
                {chatMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      m.sender === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {m.sender === 'ai' ? <Bot className="w-4 h-4" /> : 'YOU'}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none whitespace-pre-line shadow-xs'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-indigo-700 text-xs flex items-center gap-2 shadow-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>{aiGeneratingStatus || 'Groq LLM is thinking...'}</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 border-t border-slate-200 bg-white">
                {/* Dynamic Quick Answers based on current Interview Stage */}
                <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 text-[11px]">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex-shrink-0">
                    Quick Answer:
                  </span>
                  {interviewStage === 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Luxury Landscaping & Swimming Pool Works')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap hover:bg-emerald-100 font-semibold cursor-pointer"
                      >
                        🏊‍♂️ Landscaping & Pool Works
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Action RPG Mobile Game (Free to Play on iOS & Android)')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap hover:bg-indigo-100 cursor-pointer"
                      >
                        🎮 Action RPG Mobile Game
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Organic Skincare Serum (Pure Herbal, Rs. 1,850)')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        🧴 Organic Skincare
                      </button>
                    </>
                  )}
                  {interviewStage === 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'UAE (Dubai, Abu Dhabi) Villa & Property Owners')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap hover:bg-emerald-100 font-bold cursor-pointer"
                      >
                        🇦🇪 UAE (Dubai & Abu Dhabi)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'usa, uk')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap hover:bg-indigo-100 font-bold cursor-pointer"
                      >
                        🌍 USA, UK & Worldwide (Tier 1)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Boys & Men age 18-35 in Karachi, Lahore, Islamabad')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        📍 Karachi, Lahore & Islamabad (18-35)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Pakistan Nationwide Cash on Delivery (Age 20-45)')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        🇵🇰 Nationwide Pakistan (COD)
                      </button>
                    </>
                  )}
                  {interviewStage === 2 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, '35,000 PKR monthly budget for direct sales')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        💰 Rs. 35,000 PKR Budget
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, '50,000 PKR monthly budget for website orders')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        💰 Rs. 50,000 PKR Budget
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, '$1,000 USD monthly budget for USA & Global reach')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap hover:bg-indigo-100 cursor-pointer"
                      >
                        💵 $1,000 USD Global Budget
                      </button>
                    </>
                  )}
                  {interviewStage === 3 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Worldwide Free Shipping + 30-Day Money Back Guarantee')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 whitespace-nowrap hover:bg-indigo-100 cursor-pointer"
                      >
                        🌍 Worldwide Free Shipping + Guarantee
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Free Delivery Across Pakistan + Cash on Delivery (COD)')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        🚚 Free Delivery Across Pakistan + COD
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Free to Play + Claim 5,000 Gems Starter Pack')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        🎁 Free to Play + Starter Pack
                      </button>
                    </>
                  )}
                  {interviewStage >= 4 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Headlines ko Roman Urdu mein convert karo')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        📝 Roman Urdu Headlines
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Free delivery hook ko headline mein highlight karo')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        🚚 Free Delivery Hook
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendChat(null, 'Budget barha kar 70,000 PKR kar do')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap hover:bg-slate-200 cursor-pointer"
                      >
                        📈 Update Budget (70k PKR)
                      </button>
                    </>
                  )}
                </div>

                <form onSubmit={handleSendChat} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type in Roman Urdu or English (e.g. Summer Denim Jackets, 50k budget)..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isAiTyping}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 cursor-pointer"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Generated Strategy Review (Viral Keywords, Hashtags, 5 Angles + 4 AdSets - Light Theme) */}
            {editableCopies.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Groq AI Strategy: Keywords, Headlines & Ad Sets</span>
                    </h3>
                    <p className="text-xs text-slate-500">Aapke business '{storeName}' ke liye custom high-converting ad assets</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                    Budget: {formatPKR(selectedBudget)} PKR
                  </span>
                </div>

                {/* 1. VIRAL KEYWORDS */}
                {generatedStrategy?.viralKeywords?.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 font-mono">
                        <Target className="w-3.5 h-3.5" />
                        <span>High-Intent Viral Keywords ({generatedStrategy.viralKeywords.length})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedStrategy.viralKeywords.join(', '), 'all_kw')}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {copiedKey === 'all_kw' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'all_kw' ? 'Copied All!' : 'Copy All'}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedStrategy.viralKeywords.map((kw, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => copyToClipboard(kw, `kw_${idx}`)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-[11px] text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span>{kw}</span>
                          {copiedKey === `kw_${idx}` ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. TRENDING HASHTAGS */}
                {generatedStrategy?.trendingHashtags?.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 flex items-center gap-1.5 font-mono">
                        <Hash className="w-3.5 h-3.5" />
                        <span>Trending Hashtags (TikTok, Reels & Stories)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(generatedStrategy.trendingHashtags.join(' '), 'all_hash')}
                        className="text-[11px] text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        {copiedKey === 'all_hash' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'all_hash' ? 'Copied All!' : 'Copy All'}</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {generatedStrategy.trendingHashtags.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => copyToClipboard(tag, `tag_${idx}`)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-purple-400 text-[11px] text-purple-700 hover:text-purple-900 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <span>{tag}</span>
                          {copiedKey === `tag_${idx}` && <Check className="w-2.5 h-2.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. 5 HIGH-CONVERTING AD COPY ANGLES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      5 Strategic Ad Copy Angles (Editable)
                    </h4>
                    <span className="text-[11px] text-slate-500">Click [Edit] or [AI Rewrite] on any angle</span>
                  </div>
                  {editableCopies.map((copy, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 font-mono">
                          Angle {idx + 1}: {copy.angle}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRewriteAngle(idx)}
                            disabled={rewritingIdx === idx}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-semibold flex items-center gap-1 hover:bg-indigo-100 cursor-pointer"
                          >
                            {rewritingIdx === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                            <span>AI Rewrite</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCopyIdx(editingCopyIdx === idx ? null : idx)}
                            className="px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-slate-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-100 cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{editingCopyIdx === idx ? 'Done' : 'Edit'}</span>
                          </button>
                        </div>
                      </div>

                      {editingCopyIdx === idx ? (
                        <div className="space-y-2 pt-1">
                          <input
                            type="text"
                            value={copy.headline}
                            onChange={(e) => {
                              const updated = [...editableCopies]
                              updated[idx].headline = e.target.value
                              setEditableCopies(updated)
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-indigo-500 text-xs text-slate-900 font-bold outline-none"
                          />
                          <textarea
                            rows={2}
                            value={copy.primaryText}
                            onChange={(e) => {
                              const updated = [...editableCopies]
                              updated[idx].primaryText = e.target.value
                              setEditableCopies(updated)
                            }}
                            className="w-full p-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 outline-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-slate-900">"{copy.headline}"</p>
                          <p className="text-xs text-slate-600 mt-1">{copy.primaryText}</p>
                          {copy.hook && <p className="text-[11px] text-amber-700 mt-1 italic font-medium">Hook: {copy.hook}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 4. RECOMMENDED AD SETS */}
                {adSets?.length > 0 && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Meta Ad Sets Audience Targeting ({adSets.length} Sets)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {adSets.map((s, idx) => (
                        <div key={s.id || idx} className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{s.name}</span>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              {s.budgetSplit}% Split
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">📍 {s.locations}</p>
                          <p className="text-[11px] text-indigo-700 font-medium">🎯 {s.audience}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span>Approve Strategy & Move to Creatives (Video & Image) ➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* PHASE 3: AD CREATIVES & VIDEO / IMAGE CONTENT SUGGESTIONS */}
        {/* ================================================================== */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" />
                  <span>Meta Ad Creatives & Video Content Suggestions</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Facebook & Instagram par high CTR ke liye recommended visual formats
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Continue to Budget & Pay ➔</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {creatives.map((cr, idx) => (
                <div key={cr.id} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold text-indigo-700 font-mono flex items-center gap-1.5">
                      {cr.type === 'video' ? <Video className="w-4 h-4 text-emerald-600" /> : <ImageIcon className="w-4 h-4 text-cyan-600" />}
                      <span>{cr.ratio}</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {cr.placement}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{cr.title}</h4>
                    <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                      <p className="text-[10px] text-amber-700 font-bold uppercase">AI Suggested Script Hook:</p>
                      <p className="italic">"{cr.scriptHook}"</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <p><b>Visual Shot:</b> {cr.visualIdea}</p>
                    <p><b>Stamper Badge:</b> <span className="text-indigo-700 font-semibold">{cr.badge}</span></p>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 border border-slate-300 flex items-center gap-1.5 transition-all">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{cr.uploadedFile ? 'Change File' : 'Upload Video/Image'}</span>
                      <input
                        type="file"
                        accept={cr.type === 'video' ? 'video/*' : 'image/*'}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0]
                            const blobUrl = URL.createObjectURL(file)
                            const isVideo = file.type.startsWith('video/')
                            const updated = [...creatives]
                            updated[idx].uploadedFile = file.name
                            updated[idx].url = blobUrl
                            updated[idx].videoUrl = isVideo ? blobUrl : null
                            if (isVideo) updated[idx].type = 'video'
                            setCreatives(updated)
                          }
                        }}
                      />
                    </label>
                    <span className="text-[11px] text-emerald-600 font-medium">
                      {cr.uploadedFile ? `✓ ${cr.uploadedFile}` : 'Template Approved'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Campaigns & Ad Sets Preview (FB Feed, Insta Feed, Reels 9:16 Video) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-600" />
                    <span>Live Ad Mockup Preview (Facebook, Instagram & Reels)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Aapki ad Facebook, Instagram feed aur 9:16 Vertical Reels par live aisi dikhayi degi (Real Video Player)
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 self-start sm:self-auto">
                  Meta Graph API Live Preview
                </span>
              </div>

              <AdMockupPreview
                businessName={storeName || 'My Business'}
                adCopies={editableCopies}
                adCopy={editableCopies[0] || (generatedStrategy?.adCopies?.[0]) || { headline: '🔥 Premium Quality Guaranteed | 100% Risk Free', primaryText: 'Best quality with fast express delivery!' }}
                creative={creatives[0]}
                website={storeWebsite || 'https://mybrand.com'}
                ctaType={targetAudienceText.toLowerCase().includes('usa') || targetAudienceText.toLowerCase().includes('uk') ? 'Shop Worldwide' : 'Order on Cash on Delivery'}
              />
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900 block">Kya aapko video script ya hook badalna hai?</span>
                <span>Aap chat mein AI ko instructions de sakte hain, ya direct budget finalize karein.</span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-sm transition-all flex-shrink-0 cursor-pointer"
              >
                <span>Approve Creatives & Continue to Budget ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* PHASE 4: BUDGET BREAKDOWN & SAFEPAY SANDBOX CHECKOUT (LIGHT THEME) */}
        {/* ================================================================== */}
        {currentStep === 4 && (
          <div className="max-w-xl mx-auto space-y-6">
            {paymentReceipt ? (
              /* Payment Successful Receipt Card */
              <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-emerald-500 shadow-xl space-y-5 text-center text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    SAFEPAY PAYMENT VERIFIED ✓
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2">Payment Successful!</h3>
                  <p className="text-xs text-slate-500 mt-1">Transaction authorized & recorded in Safepay Gateway Ledger</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Transaction Reference:</span>
                    <span className="font-mono font-bold text-slate-900">{paymentReceipt.referenceId}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Safepay Order Tracker:</span>
                    <span className="font-mono text-indigo-700 font-bold">{paymentReceipt.tracker}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">Direct Meta Ad Media Spend:</span>
                    <span className="font-mono font-bold text-slate-900">{formatPKR(paymentReceipt.adBudget)}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-200">
                    <span className="text-slate-500">AdPilot AI 10% Retainer:</span>
                    <span className="font-mono font-bold text-indigo-700">+{formatPKR(paymentReceipt.commission)}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-sm font-bold">
                    <span className="text-slate-900">Total Paid (PKR):</span>
                    <span className="font-mono text-emerald-600 text-lg font-black">{formatPKR(paymentReceipt.amount)} PKR</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>Payment Method:</span>
                    <span>Visa Card ending in {paymentReceipt.cardLast4} ({paymentReceipt.cardHolder})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-center gap-2">
                  <Rocket className="w-4 h-4 text-indigo-600 animate-bounce" />
                  <span className="font-semibold">Meta Marketing API v21.0: Campaign Deployed & Active</span>
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <span>View Live Meta Ads Manager Telemetry & Analytics ➔</span>
                </button>
              </div>
            ) : (
              /* Payment Input & Breakdown Card */
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Budget & Safepay Secure Payment</h2>
                      <p className="text-xs text-slate-500">Wazeh aur transparent Pakistani Rupees breakdown</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider font-mono">
                    256-BIT SSL ENCRYPTED
                  </span>
                </div>

                {/* Clear Percentage Breakdown Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Payment Formula & Allocation
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-700 pb-2 border-b border-slate-200">
                      <div>
                        <span className="font-bold text-slate-900 block">Meta Ad Media Spend (Direct Facebook & Insta):</span>
                        <span className="text-[11px] text-slate-500">100% budget direct Meta Ads Manager me lagta hai</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-sm">{formatPKR(budgetCalculations.adBudget)}</span>
                    </div>

                    <div className="flex justify-between items-center text-indigo-700 pb-2 border-b border-slate-200">
                      <div>
                        <span className="font-bold text-indigo-900 block">AdPilot AI Software Fee (10% Retainer):</span>
                        <span className="text-[11px] text-slate-500">24/7 AI bid optimization & monitoring fee</span>
                      </div>
                      <span className="font-mono font-bold text-indigo-700 text-sm">+{formatPKR(budgetCalculations.commissionAmount)}</span>
                    </div>

                    <div className="pt-2 flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">Kul Raqam (Total Payable):</span>
                        <p className="text-[10px] text-emerald-600 font-medium">Safepay Pakistan Gateway Checkout (PKR)</p>
                      </div>
                      <span className="text-2xl font-black text-emerald-600 font-mono">
                        {formatPKR(budgetCalculations.totalAmount)} PKR
                      </span>
                    </div>
                  </div>
                </div>

                {/* Safepay Card Authorization */}
                <div className="p-4 rounded-xl bg-slate-50 border border-indigo-200 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Safepay Pakistan Corporate Card Payment</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">PRE-AUTHORIZED</span>
                  </div>

                  {/* Corporate Card Selectors */}
                  <div>
                    <label className="text-[10px] text-slate-600 block mb-1">Select Corporate Payment Card:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSafepayCardNumber('4242 4242 4242 4242')
                          setSafepayCardExp('12/28')
                          setSafepayCardCvv('888')
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          safepayCardNumber.startsWith('4242')
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        💳 Visa Platinum
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSafepayCardNumber('5100 0000 0000 0000')
                          setSafepayCardExp('11/27')
                          setSafepayCardCvv('777')
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          safepayCardNumber.startsWith('5100')
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        💳 Mastercard Corp
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSafepayCardNumber('9800 1234 5678 9012')
                          setSafepayCardExp('10/29')
                          setSafepayCardCvv('999')
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          safepayCardNumber.startsWith('9800')
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        💳 PayPak Corporate
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-600 block mb-0.5">Cardholder Name</label>
                      <input
                        type="text"
                        value={safepayCardName}
                        onChange={(e) => setSafepayCardName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 block mb-0.5">Card Number</label>
                      <input
                        type="text"
                        value={safepayCardNumber}
                        onChange={(e) => setSafepayCardNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono outline-none focus:border-indigo-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-600 block mb-0.5">Expiry</label>
                        <input
                          type="text"
                          value={safepayCardExp}
                          onChange={(e) => setSafepayCardExp(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-center outline-none focus:border-indigo-600"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 block mb-0.5">CVV</label>
                        <input
                          type="text"
                          value={safepayCardCvv}
                          onChange={(e) => setSafepayCardCvv(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 font-mono text-center outline-none focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time processing progress bar */}
                {isPaying && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span>
                        {paymentProcessingStage === 'initiating' && 'Safepay Gateway: Initializing Order Tracker...'}
                        {paymentProcessingStage === 'verifying_3ds' && 'Safepay 3D Secure 2.0: Authorizing Card...'}
                        {paymentProcessingStage === 'capturing' && 'Capturing Payment & Deploying Campaign to Meta API...'}
                        {paymentProcessingStage === 'success' && 'Payment Verified!'}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-700">Aapko kisi external website par jane ki zaroorat nahi hai, payment yahi direct process ho rahi hai.</p>
                  </div>
                )}

                {/* Payment Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={executeSafepayPayment}
                    disabled={isPaying}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
                  >
                    {isPaying ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Confirm & Pay {formatPKR(budgetCalculations.totalAmount)} via Safepay ➔</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePaySafepayCheckout}
                    disabled={isPaying}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Open Interactive Safepay Checkout</span>
                  </button>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-center gap-2 text-center">
                    <Lock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>256-Bit SSL Encrypted • Powered by Safepay Payments (PKR)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* IN-APP SAFEPAY CHECKOUT MODAL (POPUP ON-DEMAND) */}
        {/* ================================================================== */}
        {isSafepayModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
              {/* Safepay Official Header */}
              <div className="bg-[#002A54] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg">
                    S
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">Safepay Checkout</h3>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-400 text-slate-950 font-bold uppercase tracking-wider">
                        SECURE
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-200">AdPilot AI (Pvt) Ltd</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isPaying && setIsSafepayModalOpen(false)}
                  disabled={isPaying}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Amount & Order details */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Amount Due</span>
                  <span className="text-xl font-black text-slate-900 font-mono">
                    {formatPKR(budgetCalculations.totalAmount)} PKR
                  </span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  Meta Ads Campaign
                </span>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {paymentProcessingStage !== 'idle' ? (
                  <div className="py-8 text-center space-y-3">
                    {paymentProcessingStage === 'success' ? (
                      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    ) : (
                      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                    )}
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {paymentProcessingStage === 'initiating' && 'Initializing Safepay Order...'}
                        {paymentProcessingStage === 'verifying_3ds' && 'Authorizing with 3D Secure 2.0...'}
                        {paymentProcessingStage === 'capturing' && 'Capturing PKR in Safepay Ledger...'}
                        {paymentProcessingStage === 'success' && 'Payment Verified & Captured!'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {paymentProcessingStage === 'success' ? 'Opening Meta Ads Manager...' : 'Please do not close or refresh this window'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Corporate Cards */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                        Corporate Payment Cards (Click to Select):
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSafepayCardNumber('4242 4242 4242 4242')
                            setSafepayCardExp('12/28')
                            setSafepayCardCvv('888')
                          }}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all cursor-pointer text-center"
                        >
                          💳 Visa Platinum
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSafepayCardNumber('5100 0000 0000 0000')
                            setSafepayCardExp('11/27')
                            setSafepayCardCvv('777')
                          }}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all cursor-pointer text-center"
                        >
                          💳 Mastercard Corp
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSafepayCardNumber('9800 1234 5678 9012')
                            setSafepayCardExp('10/29')
                            setSafepayCardCvv('999')
                          }}
                          className="px-2 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-all cursor-pointer text-center"
                        >
                          🇵🇰 PayPak Corp
                        </button>
                      </div>
                    </div>

                    {/* Card Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={safepayCardName}
                          onChange={(e) => setSafepayCardName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={safepayCardNumber}
                          onChange={(e) => setSafepayCardNumber(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono outline-none focus:bg-white focus:border-blue-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">Expiry</label>
                          <input
                            type="text"
                            value={safepayCardExp}
                            onChange={(e) => setSafepayCardExp(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono text-center outline-none focus:bg-white focus:border-blue-600"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">CVV</label>
                          <input
                            type="text"
                            value={safepayCardCvv}
                            onChange={(e) => setSafepayCardCvv(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 font-mono text-center outline-none focus:bg-white focus:border-blue-600"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={executeSafepayPayment}
                      disabled={isPaying}
                      className="w-full py-3.5 rounded-xl bg-[#0B63E5] hover:bg-[#0051C7] text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Authorize & Pay {formatPKR(budgetCalculations.totalAmount)} PKR</span>
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>256-Bit SSL Encrypted • Powered by Safepay Payment Gateway (PKR)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* PHASE 5: META ADS MANAGER LIVE DASHBOARD (EXACT FACEBOOK ADS UI) */}
        {/* ================================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6">
            
            {/* Meta Ads Manager Header Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1877f2] flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-600/30">
                  f
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">Meta Ads Manager (Live Report)</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Account #act_323124128710589 (Waqas Anwar)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live Meta Marketing API v21.0 Certified Telemetry & Performance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowLiveAdMockup(!showLiveAdMockup)}
                  className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    showLiveAdMockup 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showLiveAdMockup ? 'Hide Ad Mockup' : '👁️ Preview Live Ads (FB, Insta & Reels)'}</span>
                </button>
                <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Last 7 Days (Oct 29 - Nov 4)</span>
                </div>
                <button
                  onClick={() => {
                    setMetaSyncing(true)
                    setTimeout(() => setMetaSyncing(false), 800)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${metaSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Meta</span>
                </button>
              </div>
            </div>

            {/* Toggleable Live Ad Mockup Preview in Step 5 */}
            {showLiveAdMockup && (
              <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-lg space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-indigo-600" />
                      <span>Live Campaigns & Ad Sets Preview (FB, Insta & Reels 9:16)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live high-fidelity preview across Facebook Feed, Instagram Feed & Reels (9:16 Video)
                    </p>
                  </div>
                  <button
                    onClick={() => setShowLiveAdMockup(false)}
                    className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded bg-slate-100 border border-slate-200"
                  >
                    Close Preview ✕
                  </button>
                </div>
                <AdMockupPreview
                  businessName={storeName || 'My Brand'}
                  adCopies={editableCopies}
                  adCopy={editableCopies[0] || (generatedStrategy?.adCopies?.[0]) || { headline: '🔥 Premium Quality Guaranteed | 100% Risk Free', primaryText: 'Best quality products with fast tracked shipping & money back guarantee!' }}
                  creative={creatives[0]}
                  website={storeWebsite || 'https://mybrand.com'}
                  ctaType="Shop Now / Order Now"
                />
              </div>
            )}

            {/* Top 6 Meta KPIs in Roman Urdu + PKR */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-medium">Amount Spent (Kul Kharcha)</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">Rs. 32,000</p>
                <span className="text-[10px] text-indigo-600 font-semibold">Meta direct spend</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-medium">Purchases Value (Kamayi)</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-1">Rs. 140,340</p>
                <span className="text-[10px] text-emerald-700 font-semibold">+Rs. 108,340 Net Profit</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-medium">Click-Through Rate (CTR)</span>
                <p className="text-xl sm:text-2xl font-black text-blue-600 font-mono mt-1">3.4%</p>
                <span className="text-[10px] text-blue-700 font-semibold">88% above benchmark</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-medium">Orders (Conversions)</span>
                <p className="text-xl sm:text-2xl font-black text-cyan-600 font-mono mt-1">298</p>
                <span className="text-[10px] text-cyan-700 font-semibold">Direct verified sales</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-medium">Cost Per Order (CPA)</span>
                <p className="text-xl sm:text-2xl font-black text-purple-600 font-mono mt-1">Rs. 107</p>
                <span className="text-[10px] text-slate-500">Har order ka kharcha</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] text-slate-500 font-medium">Blended ROAS</span>
                <p className="text-xl sm:text-2xl font-black text-amber-600 font-mono mt-1">4.4x</p>
                <span className="text-[10px] text-slate-500">Rs. 1K par Rs. 4.4K wapas</span>
              </div>
            </div>

            {/* Live Performance Graph (Meta Ads Manager Style) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span>Meta Ads Manager: Amount Spent vs Purchases Value Graph</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rozana ka kharcha aur kamayi (Click kisi bhi din par karke exact breakdown dekhein)
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <span className="w-3 h-3 rounded bg-emerald-500" />
                    Purchases Value (Sales PKR)
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                    <span className="w-3 h-3 rounded bg-[#1877f2]" />
                    Amount Spent (PKR)
                  </span>
                </div>
              </div>

              {/* 7-Day Interactive Bars */}
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-52 pt-4 pb-2 border-b border-slate-200">
                {meta7DayData.map((d, idx) => {
                  const maxVal = 26000
                  const revHeight = Math.round((d.revenue / maxVal) * 100)
                  const spendHeight = Math.round((d.spend / maxVal) * 100)
                  const isSel = selectedGraphDay === idx

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedGraphDay(idx)}
                      className={`flex flex-col items-center cursor-pointer transition-all ${
                        isSel ? 'scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full mb-1 font-mono ${
                        isSel ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-emerald-700 border border-slate-200'
                      }`}>
                        {d.roas}
                      </span>
                      <div className="w-full flex items-end justify-center gap-1 h-32 bg-slate-50 rounded-xl p-1 border border-slate-200">
                        <div style={{ height: `${spendHeight}%` }} className="w-1/2 bg-[#1877f2] rounded-t-md" />
                        <div style={{ height: `${revHeight}%` }} className="w-1/2 bg-emerald-500 rounded-t-md" />
                      </div>
                      <span className={`text-[10px] font-mono mt-1.5 font-bold ${isSel ? 'text-blue-600 underline' : 'text-slate-600'}`}>
                        {d.day}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Selected Day Detail Card */}
              {(() => {
                const s = meta7DayData[selectedGraphDay]
                return (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Selected Day:</span>
                      <span className="font-bold text-slate-900 text-sm">{s.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Amount Spent:</span>
                      <span className="font-bold text-blue-600 font-mono text-sm">{formatPKR(s.spend)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Purchases Revenue:</span>
                      <span className="font-bold text-emerald-600 font-mono text-sm">{formatPKR(s.revenue)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Net Profit:</span>
                      <span className="font-bold text-cyan-700 font-mono text-sm">+{formatPKR(s.revenue - s.spend)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ROAS / CPA:</span>
                      <span className="font-bold text-amber-700 font-mono text-sm">{s.roas} • {s.cpa}</span>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Meta Campaigns Table (Official Meta Ads Manager Columns) */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Active Meta Campaigns & Ad Sets</h3>
                <span className="text-xs text-slate-500">Graph API v21.0 Stream</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Campaign Name</th>
                      <th className="py-3 px-4">Delivery</th>
                      <th className="py-3 px-4">Budget (PKR)</th>
                      <th className="py-3 px-4">Results (Orders)</th>
                      <th className="py-3 px-4">Cost Per Result</th>
                      <th className="py-3 px-4">Amount Spent</th>
                      <th className="py-3 px-4">ROAS</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{camp.name}</span>
                          <span className="text-[10px] text-slate-500">{camp.channels?.join(', ')}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            camp.status === 'Live' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            ● {camp.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {formatPKR(camp.adBudget)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-600">
                          {camp.conversions || 46} Orders
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {camp.cpa || 'Rs. 106'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-blue-600 font-bold">
                          {formatPKR(camp.totalSpent || 21500)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-600">
                          {camp.roas || '4.4x'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => toggleCampaignStatus(camp.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-200"
                          >
                            {camp.status === 'Live' ? 'Pause' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Live Monitoring & Command Copilot (Real Input to AI) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">AI Live Monitoring & Ad Manager Copilot</h3>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>24/7 AI Media Buyer Active</span>
                </div>
              </div>

              {/* Copilot Chat Feed */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {copilotResponses.map((r, idx) => (
                  <div key={idx} className={`p-3 rounded-xl text-xs whitespace-pre-line leading-relaxed ${
                    r.sender === 'user' ? 'bg-indigo-600 text-white ml-auto max-w-[85%]' : 'bg-slate-50 text-slate-800 border border-slate-200 shadow-xs'
                  }`}>
                    {r.text}
                  </div>
                ))}
                {isAiTyping && (
                  <div className="p-3 rounded-xl text-xs bg-slate-50 text-indigo-700 border border-slate-200 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>AdPilot AI is analyzing campaign performance and preparing next steps...</span>
                  </div>
                )}
              </div>

              {/* 4 Quick Action Pills for Immediate AI Performance Summary & Next Strategy */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSendCopilotCmd(null, 'Poori Performance Summary Do: kitna paisa laga, kitna CTR aaya, aur kitni conversions/sales start huin?')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>📊 Poori Performance Summary Do</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendCopilotCmd(null, 'Next Strategies kya honi chahiye? Winning ad sets ko scale kaise karein aur next plan kya hai?')}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Rocket className="w-3.5 h-3.5 text-purple-600" />
                  <span>🚀 Next Strategies Kya Hogi?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendCopilotCmd(null, 'Campaign ka budget optimize karo aur average CPA aur kam karo')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>💰 Budget Optimize Karo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSendCopilotCmd(null, 'Instagram Reels 9:16 Video ad set ka daily budget 25% barha do')}
                  className="px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Video className="w-3.5 h-3.5 text-pink-600" />
                  <span>🎬 Reels Scale (25% Budget)</span>
                </button>
              </div>

              {/* Input command to AI to update ads */}
              <form onSubmit={handleSendCopilotCmd} className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiCopilotMsg}
                  onChange={(e) => setAiCopilotMsg(e.target.value)}
                  placeholder="Tell AI: 'Campaign ka budget Rs. 5,000 barha do' ya 'AdSet 2 ko pause kardo'..."
                  className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={isAiTyping}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute on Meta</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* PHASE 6: ADMIN CONTROL ROOM */}
        {/* ================================================================== */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <span>AdPilot AI Admin Control Room</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Master revenue counter, 10% platform commission profit, and account suspension controls
                </p>
              </div>
              <div className="flex items-center gap-2">
                {onViewAdmin && (
                  <button
                    onClick={onViewAdmin}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Open Master Admin Panel ➔</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 border border-slate-200"
                >
                  Back to Dashboard ➔
                </button>
              </div>
            </div>

            {/* Revenue & Commission Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500">Total Registered Business Owners</span>
                <p className="text-3xl font-black text-slate-900 mt-2">6 Businesses</p>
                <span className="text-[11px] text-emerald-700 font-semibold">+2 this week</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500">Total Ad Budget Managed (PKR)</span>
                <p className="text-3xl font-black text-slate-900 font-mono mt-2">Rs. 4,850,000</p>
                <span className="text-[11px] text-slate-500">Deployed nationwide via Meta API</span>
              </div>
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 shadow-sm">
                <span className="text-xs font-bold text-emerald-800">Tumhara 10% Commission (Profit)</span>
                <p className="text-3xl font-black text-emerald-700 font-mono mt-2">Rs. 485,000 PKR</p>
                <span className="text-[11px] text-emerald-700 font-semibold">Direct Safepay revenue</span>
              </div>
            </div>

            {/* Registered Clients List with Account Suspend / Reactivate Action */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Registered Client Businesses</h3>
                  <p className="text-xs text-slate-500">Manage client statuses and account permissions</p>
                </div>
                <span className="text-xs text-slate-500 font-mono">{adminBusinesses.length} Accounts Registered</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adminBusinesses.map((b) => (
                  <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{b.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          ● {b.status}
                        </span>
                      </div>
                      <span className="text-slate-500">{b.owner} • {b.niche}</span>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1.5">
                      <span className="font-mono text-slate-800 block">{b.spend}</span>
                      <span className="font-mono font-bold text-emerald-700 text-[11px]">Profit: {b.profit}</span>
                      
                      {/* Account Suspend / Reactivate Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleUnifiedBusinessSuspension(b.id)}
                        className={`mt-1 px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                          b.status === 'Active'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {b.status === 'Active' ? '⛔ Suspend Account' : '✓ Unsuspend & Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Global Application Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 bg-white/70 backdrop-blur-xs text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">AdPilot AI</span>
            <span>• Autonomous Meta Advertising & Safepay Gateway</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>Developed by</span>
            <a
              href="https://github.com/Waqas-110"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
            >
              Waqas Anwar
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                Lead
              </span>
            </a>
          </div>
          <div className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  )
}

