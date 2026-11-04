import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCampaign } from '../context/CampaignContext'
import { calculateCampaignCosts, formatPKR } from '../services/safepay'
import { generateCampaignStrategy, rewriteCampaignAngle, sendChatToLLM } from '../services/ai'
import CreativeUploader from './CreativeUploader'
import AdMockupPreview from './AdMockupPreview'
import {
  Bot,
  Send,
  Sparkles,
  X,
  CheckCircle2,
  TrendingUp,
  Target,
  Layers,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Zap,
  Globe,
  Sliders,
  Hash,
  Key,
  Copy,
  Check,
  FileText,
  Flame,
  Loader2,
  UploadCloud,
  Image as ImageIcon,
  Edit3,
  Save,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Settings2
} from 'lucide-react'
import adPilotLogo from '../assets/logo.png'

export default function AiChatbot({ onClose }) {
  const { user } = useAuth()
  const { setCheckoutModalData } = useCampaign()

  const [step, setStep] = useState(1) // 1: Business & Niche, 2: Audience, 3: Goals, 4: Generated Strategy & Copies, 5: Creatives & Review
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [aiGeneratingStatus, setAiGeneratingStatus] = useState('')
  const [copiedKey, setCopiedKey] = useState(null)
  const chatBottomRef = useRef(null)

  // Business & Niche State (Clean defaults, user's real business name if logged in, else empty)
  const [businessName, setBusinessName] = useState(user?.user_metadata?.business_name || '')
  const [businessLogo, setBusinessLogo] = useState(null)
  const [industry, setIndustry] = useState('Fashion & Apparel')
  const [niche, setNiche] = useState('')
  const [website, setWebsite] = useState('')
  const [productDesc, setProductDesc] = useState('')

  // Target Audience State
  const [targetAudience, setTargetAudience] = useState('Online Shoppers in Karachi, Lahore, Islamabad (Age 18-35)')
  const [locations, setLocations] = useState('Pakistan Nationwide (COD)')
  const [interests, setInterests] = useState('Online Shopping, Fashion, Discount Deals, Cash on Delivery')

  // Goals & Channels State
  const [adGoal, setAdGoal] = useState('E-commerce Sales & ROAS Maximization')
  const [selectedChannels, setSelectedChannels] = useState(['Meta (Facebook & Instagram)'])
  const [customBudget, setCustomBudget] = useState(50000)

  // Conversational Chat state
  const [chatInput, setChatInput] = useState('')
  const [isChatSubmitting, setIsChatSubmitting] = useState(false)

  // Creatives State
  const [creatives, setCreatives] = useState([])

  // AI Generated Strategic Plan (Viral Keywords, Hashtags, Ad Copies)
  const [strategyPlan, setStrategyPlan] = useState(null)
  const [editableCopies, setEditableCopies] = useState([])
  const [editingCopyIndex, setEditingCopyIndex] = useState(null)
  const [selectedAdCopyIndex, setSelectedAdCopyIndex] = useState(0)

  // AI Recommended AdSets (Selectable & Editable)
  const [adSets, setAdSets] = useState([])
  const [editingAdSetId, setEditingAdSetId] = useState(null)
  const [rewritingIdx, setRewritingIdx] = useState(null)

  const handleAiRewrite = async (idx) => {
    setRewritingIdx(idx)
    try {
      const copyToRewrite = editableCopies[idx]
      const res = await rewriteCampaignAngle({
        businessName,
        niche,
        angle: copyToRewrite?.angle,
        currentHeadline: copyToRewrite?.headline,
        currentPrimaryText: copyToRewrite?.primaryText
      })

      if (res?.headline) {
        setEditableCopies((prev) => {
          const next = [...prev]
          next[idx] = {
            ...next[idx],
            headline: res.headline,
            hook: res.hook || next[idx].hook,
            primaryText: res.primaryText || next[idx].primaryText,
            callToAction: res.callToAction || next[idx].callToAction,
            badge: res.badge || '✨ Rewritten by Groq AI'
          }
          return next
        })
      }
    } catch (err) {
      console.error('Rewrite failed:', err)
    } finally {
      setRewritingIdx(null)
    }
  }

  const handleUpdateCopy = (index, field, value) => {
    setEditableCopies((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleToggleAdSet = (id) => {
    setAdSets((prev) => prev.map((s) => s.id === id ? { ...s, selected: !s.selected } : s))
  }

  const handleUpdateAdSet = (id, field, value) => {
    setAdSets((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setBusinessLogo(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Auto scroll
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, step, aiGeneratingStatus])

  // Initial Greeting
  useEffect(() => {
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Friend'
    const bName = businessName || user?.user_metadata?.business_name

    setMessages([
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: `Salam ${userName}! 🚀 Main aapka AdPilot AI Campaign Strategist hoon. Main Groq LLM API ke zariye aapke Pakistani business ke liye viral keywords, high-converting ad angles aur Meta Ad sets tayyar karunga.`,
        timestamp: 'Just now'
      },
      {
        id: 'msg_step1',
        sender: 'ai',
        text: bName 
          ? `Aapke brand '**${bName}**' ke liye hum Meta Ads strategy build kar rahe hain. 📌 **Step 1 (Product & USP):** Aapka main hero product kya hai aur iski price / USP kya hai? (Jaise ke: Summer Denim Jackets for Rs. 2,999)`
          : `Chalein shuru karte hain: Aapke business ka naam aur category (niche) kya hai? (Jaise ke: Nova Gaming - Mobile Games, Organic Skincare, ya Digital Products). Aap neeche chat bar mein likh kar bhej sakte hain ya form use karein!`,
        timestamp: 'Just now'
      }
    ])
  }, [user, businessName])

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Generate strategy via Groq LLM
  const triggerStrategyGeneration = async ({
    businessName: bName,
    industry: ind,
    niche: nch,
    productDesc: pDesc,
    targetAudience: tAud,
    budget: bVal
  }) => {
    setIsTyping(true)
    setAiGeneratingStatus('Connecting to Groq LLM (openai/gpt-oss-120b)...')

    const activeBiz = bName || businessName || 'Brand'
    const activeNiche = nch || niche || 'Clothing & Fashion'
    const activeProduct = pDesc || productDesc || 'High Quality Products'
    const activeAudience = tAud || targetAudience || 'Pakistani Online Shoppers'
    const activeBudget = bVal || customBudget || 50000

    setCustomBudget(activeBudget)

    try {
      setTimeout(() => setAiGeneratingStatus(`Groq LLM is crafting high-ROAS angles for ${activeBiz}...`), 400)

      const generated = await generateCampaignStrategy({
        businessName: activeBiz,
        industry: ind || industry || 'Fashion & Apparel',
        niche: activeNiche,
        productDesc: activeProduct,
        targetAudience: activeAudience,
        adGoal,
        channels: selectedChannels
      })

      const rawRecommended = generated.recommendedBudget || activeBudget
      const recommended = rawRecommended < 5000 ? rawRecommended * 25 : rawRecommended
      setCustomBudget(recommended)

      const copies = (generated.adCopies && generated.adCopies.length > 0) ? generated.adCopies : [
        {
          id: 'copy_1',
          angle: 'Direct Urgency / Flash Discount',
          hook: `Flash Sale Alert: Flat 25% OFF ${activeBiz} for 24 hours only!`,
          headline: `Limited Time Drop: 25% OFF ${activeBiz} + Free Delivery Across Pakistan`,
          primaryText: `Don't miss out on Pakistan's favorite ${activeNiche.toLowerCase()}. Backed by 7-day money-back guarantee and fast courier delivery.`,
          callToAction: 'Shop Flash Sale',
          badge: 'High Conversion'
        },
        {
          id: 'copy_2',
          angle: 'Cash on Delivery (COD) & Trust Hook',
          hook: 'Order with 100% confidence — open parcel before paying!',
          headline: `Cash on Delivery Available Nationwide | 100% Risk-Free`,
          primaryText: `Pay when your parcel arrives at your doorstep anywhere in Pakistan. Genuine quality guaranteed with instant WhatsApp support.`,
          callToAction: 'Order on COD',
          badge: 'Maximum Trust'
        },
        {
          id: 'copy_3',
          angle: 'Viral UGC / Customer Reviews',
          hook: 'Over 10,000+ satisfied customers across Karachi, Lahore & Islamabad...',
          headline: `Why 10,000+ Online Shoppers Switched to ${activeBiz} This Month`,
          primaryText: `98% of buyers rated us 5 stars for durability and fast delivery. See the difference for yourself today.`,
          callToAction: 'Read Reviews & Buy Now',
          badge: 'High ROAS'
        },
        {
          id: 'copy_4',
          angle: 'Problem-Agitation-Solution (PAS)',
          hook: `Tired of ordinary ${activeNiche}? You deserve better.`,
          headline: `Stop Settling for Cheap Copies. Experience Real ${activeBiz}.`,
          primaryText: `Engineered with premium grade materials to last for years. Say goodbye to frequent replacements.`,
          callToAction: 'Upgrade Your Daily Carry',
          badge: 'High CTR'
        },
        {
          id: 'copy_5',
          angle: 'VIP Lifestyle & Premium Elevation',
          hook: 'Elevate your daily routine with handcrafted luxury.',
          headline: `The Modern Executive's Choice: ${activeProduct}`,
          primaryText: `Designed for those who appreciate fine aesthetics and seamless functionality. Enjoy complimentary express delivery.`,
          callToAction: 'Claim Your VIP Package',
          badge: 'Premium Brand'
        }
      ]
      setEditableCopies(copies)

      const proposedSets = (generated.recommendedAdSets && generated.recommendedAdSets.length > 0) ? generated.recommendedAdSets : [
        {
          id: 'adset_1',
          name: 'Metro Cities High-Intent Shoppers',
          locations: 'Karachi, Lahore, Islamabad, Rawalpindi',
          audience: 'Age 22-45 | Online Shopping & Fashion',
          budgetSplit: 40,
          selected: true,
          placementType: 'Feed Images Only'
        },
        {
          id: 'adset_2',
          name: 'Nationwide Cash on Delivery (COD) Shoppers',
          locations: 'All Pakistan (Tier 1 & Tier 2 Cities)',
          audience: 'Age 18-50 | COD Buyers, Discount Deals',
          budgetSplit: 35,
          selected: true,
          placementType: 'Feed Images Only'
        },
        {
          id: 'adset_3',
          name: 'Social Engagement & Retargeting',
          locations: 'Pakistan Nationwide',
          audience: 'Engaged with Instagram/Facebook page in last 30 days',
          budgetSplit: 25,
          selected: true,
          placementType: 'Retargeting Feed'
        },
        {
          id: 'adset_4',
          name: 'Advantage+ Broad Viral Reach',
          locations: 'Pakistan Nationwide',
          audience: 'Algorithmic Lookalike & Broad Reach',
          budgetSplit: 10,
          selected: false,
          placementType: 'Broad AI Discovery'
        }
      ]
      setAdSets(proposedSets)

      const fullPlan = {
        ...generated,
        recommendedBudget: recommended,
        adCopies: copies,
        recommendedAdSets: proposedSets
      }

      setStrategyPlan(fullPlan)
      setIsTyping(false)
      setAiGeneratingStatus('')
      setStep(4)

      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_strat_' + Date.now(),
          sender: 'ai',
          text: `🎯 Groq LLM generation complete for **${activeBiz}** (${activeNiche})! Maine 5 high-converting ad angles aur 4 targeted Meta Ad Sets generate kiye hain. Aap kisi bhi headline ko edit kar sakte hain ya **[🤖 AI Rewrite]** button se Groq se mazeed variations nikalwa sakte hain.`
        }
      ])
    } catch (err) {
      console.error('Error during AI generation:', err)
      setIsTyping(false)
      setAiGeneratingStatus('')
    }
  }

  // Conversational chat handler connected to Groq LLM
  const handleSendChat = async (e, textOverride = null) => {
    if (e) e.preventDefault()
    const textToSend = (textOverride || chatInput).trim()
    if (!textToSend || isChatSubmitting) return

    setChatInput('')
    setIsChatSubmitting(true)

    // Add user message to conversation
    const userMsg = {
      id: 'user_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now'
    }
    setMessages((prev) => [...prev, userMsg])
    setIsTyping(true)
    setAiGeneratingStatus('Groq LLM is thinking...')

    try {
      let nextBiz = businessName
      let nextNiche = niche
      let nextProduct = productDesc
      let nextAud = targetAudience
      let nextBudget = customBudget

      if (step === 1) {
        if (!businessName) {
          const parts = textToSend.split(/,|•|-|aur|and/i)
          nextBiz = parts[0]?.trim() || textToSend
          nextNiche = parts[1]?.trim() || textToSend
          setBusinessName(nextBiz)
          setNiche(nextNiche)
        } else {
          nextNiche = textToSend
          setNiche(textToSend)
        }
      } else if (step === 2) {
        nextProduct = textToSend
        setProductDesc(textToSend)
      } else if (step === 3) {
        nextAud = textToSend
        setTargetAudience(textToSend)
      } else if (step >= 4) {
        const numMatch = textToSend.replace(/,/g, '').match(/\d+/)
        if (numMatch) {
          const val = parseInt(numMatch[0])
          if (val > 1000) {
            nextBudget = val
            setCustomBudget(val)
          }
        }
      }

      // Call Real Groq LLM Chat API
      const aiRes = await sendChatToLLM({
        messages: [...messages, userMsg],
        businessContext: {
          businessName: nextBiz,
          niche: nextNiche,
          productDesc: nextProduct,
          targetAudience: nextAud,
          customBudget: nextBudget
        }
      })

      // Add AI response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: aiRes.reply,
          timestamp: 'Just now',
          provider: aiRes.provider || 'Groq LLM (openai/gpt-oss-120b)'
        }
      ])

      // Auto advance step when user is answering the guided questions
      if (step === 1 && (nextBiz || nextNiche)) {
        setTimeout(() => setStep(2), 500)
      } else if (step === 2 && nextProduct) {
        setTimeout(() => setStep(3), 500)
      } else if (step === 3) {
        // Automatically launch strategy generation with Groq LLM!
        setTimeout(() => {
          triggerStrategyGeneration({
            businessName: nextBiz || 'Brand',
            industry: industry || 'Fashion & Apparel',
            niche: nextNiche || 'Clothing & Fashion',
            productDesc: nextProduct || 'Summer Denim Jackets',
            targetAudience: nextAud,
            budget: nextBudget
          })
        }, 600)
      }
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setIsTyping(false)
      setIsChatSubmitting(false)
      setAiGeneratingStatus('')
    }
  }

  // Step 1: Submit Business & Niche Form
  const handleBusinessSubmit = (e) => {
    e.preventDefault()
    if (!businessName) return

    setMessages((prev) => [
      ...prev,
      {
        id: 'user_biz',
        sender: 'user',
        text: `Business: ${businessName} | Niche: ${niche || industry} (${industry}) | Hero Product: ${productDesc || 'Main Catalog'}.`
      }
    ])

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setStep(2)
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_aud',
          sender: 'ai',
          text: `Target niche '${niche || businessName}' received! Ab batayein aapki target audience konsi hai aur delivery kin cities mein hoti hai?`
        }
      ])
    }, 400)
  }

  // Step 2: Submit Audience Form
  const handleAudienceSubmit = (e) => {
    e.preventDefault()

    setMessages((prev) => [
      ...prev,
      {
        id: 'user_aud',
        sender: 'user',
        text: `Target Audience: ${targetAudience} | Geos: ${locations}.`
      }
    ])

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setStep(3)
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_goals',
          sender: 'ai',
          text: `Targeting locked! Ab apna monthly Meta ad budget select karein taake Groq LLM complete strategy generate kare:`
        }
      ])
    }, 400)
  }

  // Step 3: Trigger LLM Strategy Generation
  const handleGoalsSubmit = async (e) => {
    e.preventDefault()

    setMessages((prev) => [
      ...prev,
      {
        id: 'user_goals',
        sender: 'user',
        text: `Goal: ${adGoal} | Budget: ${formatPKR(customBudget)} | Deploying Networks: ${selectedChannels.join(', ')}.`
      }
    ])

    await triggerStrategyGeneration({
      businessName,
      industry,
      niche,
      productDesc,
      targetAudience,
      budget: customBudget
    })
  }

  // Step 4: Proceed to Creatives Upload
  const handleProceedToCreatives = () => {
    const selectedSets = adSets.filter((s) => s.selected)
    if (selectedSets.length === 0) {
      alert('Please select at least 1 Ad Set to proceed.')
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'user_approve_budget',
        sender: 'user',
        text: `Selected ${selectedSets.length} Ad Sets & ${formatPKR(customBudget)} budget approved! Proceeding to upload media creatives.`
      }
    ])

    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setStep(5)
      setMessages((prev) => [
        ...prev,
        {
          id: 'ai_creatives_req',
          sender: 'ai',
          text: `Great choice! Now, upload your ad media assets (1:1 feed images or 9:16 vertical videos). Below you will see all your active running Ad Sets before final Safepay checkout.`
        }
      ])
    }, 500)
  }

  // Step 5: Final Approval & Safepay Sandbox Trigger
  const handleFinalApprovalAndCheckout = () => {
    if (creatives.length === 0) {
      alert('Please upload or insert at least 1 ad creative to proceed.')
      return
    }

    const selectedSets = adSets.filter((s) => s.selected)
    if (selectedSets.length === 0) {
      alert('Please select at least 1 Ad Set to run.')
      return
    }

    const costBreakdown = calculateCampaignCosts(customBudget)

    // Placement detection
    const hasVideos = creatives.some((c) => c.type === 'video')
    const defaultPlacement = hasVideos ? 'Instagram & Facebook Reels' : 'Meta Feed (Images Only)'

    // Calculate dynamic budget split per selected Ad Set
    const totalSplit = selectedSets.reduce((sum, s) => sum + (s.budgetSplit || 25), 0) || 100
    const activeRunningAdSets = selectedSets.map((s, idx) => {
      const setShare = (s.budgetSplit || 25) / totalSplit
      const setBudget = Math.round(costBreakdown.adBudget * setShare)
      return {
        id: s.id || `adset_${idx + 1}`,
        name: s.name,
        locations: s.locations,
        audience: s.audience,
        budget: setBudget,
        budgetSharePercent: Math.round(setShare * 100),
        status: 'Live',
        headline: editableCopies[selectedAdCopyIndex]?.headline || 'High-Converting Offer',
        primaryText: editableCopies[selectedAdCopyIndex]?.primaryText || '',
        callToAction: editableCopies[selectedAdCopyIndex]?.callToAction || 'Shop Now',
        placement: s.placementType || defaultPlacement,
        creativesCount: creatives.length
      }
    })

    const campaignDraft = {
      name: `${businessName} - ${niche.slice(0, 24)} (PKR Multi-AdSet Campaign)`,
      businessName,
      businessLogo,
      industry,
      niche,
      website,
      audience: targetAudience,
      locations,
      channels: [defaultPlacement],
      placements: [defaultPlacement],
      adSetName: activeRunningAdSets[0]?.name || 'Primary AdSet',
      adSets: activeRunningAdSets,
      activeAdSetsCount: activeRunningAdSets.length,
      objective: adGoal,
      adBudget: costBreakdown.adBudget,
      commissionPaid: costBreakdown.commissionAmount,
      totalCost: costBreakdown,
      creatives: creatives,
      strategyPlan: {
        ...strategyPlan,
        adCopies: editableCopies,
        recommendedAdSets: activeRunningAdSets
      },
      selectedAdCopy: editableCopies[selectedAdCopyIndex] || null
    }

    // Set checkout modal in context
    setCheckoutModalData(campaignDraft)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
      <div
        className="relative w-full max-w-4xl h-[90vh] max-h-[850px] rounded-2xl glass-panel border border-slate-700/80 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div className="p-4 sm:px-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white shadow-md">
              <Bot className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  AdPilot AI Strategy & Copy Copilot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Step {step} of 5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Powered by Groq / OpenAI LLM • Safepay Commission Model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Bar */}
        <div className="grid grid-cols-5 border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-medium text-slate-400">
          <div className={`p-2 text-center border-r border-slate-800/80 ${step >= 1 ? 'text-indigo-400 bg-indigo-500/5 font-bold' : ''}`}>
            1. Niche & Biz
          </div>
          <div className={`p-2 text-center border-r border-slate-800/80 ${step >= 2 ? 'text-indigo-400 bg-indigo-500/5 font-bold' : ''}`}>
            2. Audience
          </div>
          <div className={`p-2 text-center border-r border-slate-800/80 ${step >= 3 ? 'text-indigo-400 bg-indigo-500/5 font-bold' : ''}`}>
            3. Goals & LLM
          </div>
          <div className={`p-2 text-center border-r border-slate-800/80 ${step >= 4 ? 'text-indigo-400 bg-indigo-500/5 font-bold' : ''}`}>
            4. Viral Copies
          </div>
          <div className={`p-2 text-center ${step >= 5 ? 'text-indigo-400 bg-indigo-500/5 font-bold' : ''}`}>
            5. Creatives & Pay
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {m.sender === 'ai' ? (
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-200 text-xs font-bold">
                  YOU
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                  }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 max-w-[85%] animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-indigo-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                <span>{aiGeneratingStatus || 'AdPilot AI is thinking...'}</span>
              </div>
            </div>
          )}

          {/* STEP 1: BUSINESS & NICHE FORM */}
          {step === 1 && !isTyping && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 mt-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Step 1: Input Your Business Niche & Offer</span>
              </div>
              <form onSubmit={handleBusinessSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium">Business / Brand Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Lumina Apparel"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium">Industry Category</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    >
                      <option>E-commerce / DTC</option>
                      <option>B2B SaaS / Software</option>
                      <option>Health & Wellness</option>
                      <option>Lead Gen / Professional Services</option>
                      <option>Mobile App / Gaming</option>
                      <option>Fashion & Apparel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Specific Business Niche (LLM Creative Input)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. Clothing & Streetwear, Organic Skincare, Leather Goods, Tech Gadgets"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-indigo-500/50 text-xs text-white outline-none focus:border-indigo-400"
                  />
                  <p className="text-[10px] text-indigo-300 mt-1">
                    Groq LLM is niche ko analyze karke 100% custom-tailored keywords aur high-converting ad angles generate karega.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium">Store / Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourbrand.pk"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium">Hero Product / Service</label>
                    <input
                      type="text"
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      placeholder="e.g. Summer Denim Jackets with Free Cash on Delivery"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Brand Logo Upload (Kaise Bana Hai Ad Preview me Show Hoga) */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] text-slate-200 font-medium flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Brand / Business Logo (Ad Preview Me Show Hoga)</span>
                    </label>
                    {businessLogo && (
                      <span className="text-[10px] text-emerald-400 font-semibold">✓ Logo Attached</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-indigo-400 text-xs text-slate-300 flex items-center gap-2 transition-all">
                      <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{businessLogo ? 'Change Brand Logo' : 'Upload Business Logo (PNG/JPG)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {businessLogo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-indigo-400/50 bg-slate-900">
                          <img src={businessLogo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <button
                          type="button"
                          onClick={() => setBusinessLogo(null)}
                          className="text-[10px] text-red-400 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        Optional: Agar upload nahi karenge toh business initials monogram use hoga.
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
                >
                  <span>Submit Niche Details → Define Audience</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: AUDIENCE FORM */}
          {step === 2 && !isTyping && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 mt-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Target className="w-4 h-4" />
                <span>Step 2: Define Target Audience for {niche}</span>
              </div>
              <form onSubmit={handleAudienceSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium">Demographics & Buyer Persona</label>
                  <input
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Young Professionals & Remote Workers (Age 24-42)"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium">Target Locations / Geos</label>
                    <input
                      type="text"
                      value={locations}
                      onChange={(e) => setLocations(e.target.value)}
                      placeholder="e.g. United States, Canada, UK"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-medium">Core Interests & Triggers</label>
                    <input
                      type="text"
                      value={interests}
                      onChange={(e) => setInterests(e.target.value)}
                      placeholder="e.g. Home Office, Ergonomics, Wellness"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-medium text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/30"
                >
                  <span>Lock In Target Audience → Select Goals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: GOALS & LLM GENERATION FORM */}
          {step === 3 && !isTyping && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 mt-2 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <TrendingUp className="w-4 h-4" />
                <span>Step 3: Campaign Goals & LLM Copywriter</span>
              </div>
              <form onSubmit={handleGoalsSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] text-slate-300 font-medium">Primary Campaign Goal</label>
                  <select
                    value={adGoal}
                    onChange={(e) => setAdGoal(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option>E-commerce Sales & ROAS Maximization</option>
                    <option>High-Ticket Lead Generation</option>
                    <option>Brand Discovery & Viral Video Reach</option>
                    <option>App Installs & Low CPA Registrations</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 font-medium block mb-1.5">
                    Target Advertising Networks
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Meta', 'Google Ads', 'TikTok'].map((channel) => {
                      const isSelected = selectedChannels.includes(channel)
                      return (
                        <button
                          type="button"
                          key={channel}
                          onClick={() => {
                            if (isSelected) {
                              if (selectedChannels.length > 1) {
                                setSelectedChannels(selectedChannels.filter((c) => c !== channel))
                              }
                            } else {
                              setSelectedChannels([...selectedChannels, channel])
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                        >
                          {channel}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Viral Keywords, Hashtags & Ad Copies (LLM)</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: DISPLAY GENERATED VIRAL KEYWORDS, HASHTAGS & AD COPIES */}
          {step === 4 && strategyPlan && !isTyping && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-5 mt-2 animate-fadeIn">

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-bold text-white">
                    AI Generated Assets for <span className="text-indigo-400">'{niche}'</span>
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                  {strategyPlan.engineUsed || 'LLM Engine'}
                </span>
              </div>

              {/* 1. VIRAL KEYWORDS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Viral Search Keywords</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(strategyPlan.viralKeywords.join(', '), 'all_keywords')}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'all_keywords' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'all_keywords' ? 'Copied!' : 'Copy All'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {strategyPlan.viralKeywords.map((kw, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => copyToClipboard(kw, `kw_${idx}`)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group"
                    >
                      <span>{kw}</span>
                      {copiedKey === `kw_${idx}` ? (
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-slate-500 group-hover:text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. TRENDING HASHTAGS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-purple-400" />
                    <span>Trending Hashtags (TikTok, Reels, Shorts)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(strategyPlan.trendingHashtags.join(' '), 'all_hashtags')}
                    className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                  >
                    {copiedKey === 'all_hashtags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'all_hashtags' ? 'Copied!' : 'Copy Hashtags'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {strategyPlan.trendingHashtags.map((ht, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px] font-mono"
                    >
                      {ht}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. AI STRATEGY & HEADLINE OPTIONS (5 EDITABLE OPTIONS) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span>AI Strategy Suggestions (5 Options — All Editable)</span>
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aap in me se pasandida option choose karein, ya ✏️ Edit dabakar headline aur text customize karein:
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold self-start sm:self-auto">
                    {editableCopies.length} Options Generated
                  </span>
                </div>

                <div className="space-y-3">
                  {editableCopies.map((copy, idx) => {
                    const isSelected = selectedAdCopyIndex === idx
                    const isEditing = editingCopyIndex === idx

                    return (
                      <div
                        key={copy.id || idx}
                        onClick={() => !isEditing && setSelectedAdCopyIndex(idx)}
                        className={`p-4 rounded-xl border transition-all ${isSelected
                            ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/40 shadow-lg'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                          }`}
                      >
                        {/* Option Header */}
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                              Option {idx + 1}: {copy.angle}
                            </span>
                            {copy.badge && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                                {copy.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAiRewrite(idx)
                              }}
                              disabled={rewritingIdx === idx}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-[11px] text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                              title="Generate an algorithmic rewrite via Groq LLM"
                            >
                              {rewritingIdx === idx ? (
                                <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                              ) : (
                                <Sparkles className="w-3 h-3 text-indigo-400" />
                              )}
                              <span>{rewritingIdx === idx ? 'Rewriting...' : '🤖 AI Rewrite'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingCopyIndex(isEditing ? null : idx)
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors"
                            >
                              <Edit3 className="w-3 h-3 text-indigo-400" />
                              <span>{isEditing ? 'Done Editing' : 'Edit Headline & Copy'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedAdCopyIndex(idx)
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${isSelected
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                }`}
                            >
                              {isSelected ? '✓ Selected' : 'Choose This'}
                            </button>
                          </div>
                        </div>

                        {/* Content (View or Edit Mode) */}
                        {isEditing ? (
                          <div className="space-y-3 pt-1" onClick={(e) => e.stopPropagation()}>
                            <div>
                              <label className="text-[10px] text-amber-300 font-bold uppercase block mb-1">
                                Edit Headline (Punchy Offer):
                              </label>
                              <input
                                type="text"
                                value={copy.headline}
                                onChange={(e) => handleUpdateCopy(idx, 'headline', e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-indigo-500/60 text-xs text-white font-bold outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                                Edit Opening Hook:
                              </label>
                              <input
                                type="text"
                                value={copy.hook}
                                onChange={(e) => handleUpdateCopy(idx, 'hook', e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                                Edit Primary Body Copy:
                              </label>
                              <textarea
                                rows={3}
                                value={copy.primaryText}
                                onChange={(e) => handleUpdateCopy(idx, 'primaryText', e.target.value)}
                                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                                  Call to Action (CTA Button):
                                </label>
                                <input
                                  type="text"
                                  value={copy.callToAction}
                                  onChange={(e) => handleUpdateCopy(idx, 'callToAction', e.target.value)}
                                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-bold outline-none"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingCopyIndex(null)}
                                className="mt-4 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1 shadow-sm"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Changes</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 cursor-pointer">
                            <div>
                              <span className="text-[10px] text-amber-300 uppercase font-semibold">Opening Hook:</span>
                              <p className="text-xs font-bold text-white mt-0.5">"{copy.hook}"</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-semibold">Headline:</span>
                              <p className="text-xs font-bold text-indigo-200 mt-0.5">{copy.headline}</p>
                            </div>
                            <p className="text-[11px] text-slate-300 line-clamp-2">
                              {copy.primaryText}
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                              <span className="text-emerald-400 font-semibold">Button: {copy.callToAction}</span>
                              <span className="text-[10px] text-slate-500">Click ✏️ Edit to customize text</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 4. RECOMMENDED AD SETS PROPOSAL (CHOOSE & CUSTOMIZE WHICH ONES TO RUN) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      <span>Recommended Target Ad Sets (Choose Which Ones to Run)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      AI ne aapke niche ke liye yeh Ad Sets propose kiye hain. Jo pasand hon unhe tick karein, budget un me distribute ho jayega:
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-mono font-bold self-start sm:self-auto">
                    {adSets.filter((s) => s.selected).length} of {adSets.length} Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {adSets.map((set) => {
                    const selectedSets = adSets.filter((s) => s.selected)
                    const totalSplit = selectedSets.reduce((sum, s) => sum + (s.budgetSplit || 25), 0) || 100
                    const setShare = set.selected ? (set.budgetSplit || 25) / totalSplit : 0
                    const setBudget = Math.round(customBudget * setShare)
                    const isEditingSet = editingAdSetId === set.id

                    return (
                      <div
                        key={set.id}
                        className={`p-3.5 rounded-xl border transition-all ${set.selected
                            ? 'bg-slate-900 border-indigo-500/50 shadow-md'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={set.selected}
                              onChange={() => handleToggleAdSet(set.id)}
                              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                            <span className="font-bold text-xs text-white">
                              {set.name}
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={() => setEditingAdSetId(isEditingSet ? null : set.id)}
                            className="p-1 text-slate-400 hover:text-indigo-400 rounded transition-colors"
                            title="Edit AdSet Audience & Target Cities"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* AdSet Details or Edit Form */}
                        {isEditingSet ? (
                          <div className="mt-2.5 space-y-2 pt-2 border-t border-slate-800">
                            <div>
                              <label className="text-[10px] text-slate-400 block">AdSet Name:</label>
                              <input
                                type="text"
                                value={set.name}
                                onChange={(e) => handleUpdateAdSet(set.id, 'name', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 block">Target Locations:</label>
                              <input
                                type="text"
                                value={set.locations}
                                onChange={(e) => handleUpdateAdSet(set.id, 'locations', e.target.value)}
                                className="w-full px-2 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditingAdSetId(null)}
                              className="px-2.5 py-1 rounded bg-indigo-600 text-[10px] font-bold text-white"
                            >
                              Done Editing
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 text-[11px] space-y-1 text-slate-400">
                            <p><span className="text-slate-500">📍 Locations:</span> <b className="text-slate-300">{set.locations}</b></p>
                            <p><span className="text-slate-500">🎯 Audience:</span> {set.audience}</p>
                            <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                              <span className="text-indigo-300 font-mono font-semibold">
                                {set.selected ? `${formatPKR(setBudget)} PKR` : 'Excluded'}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {set.placementType || 'Feed Placement'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 5. BUDGET ADJUSTER IN PKR */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">
                    Total Monthly Media Budget (Divided Across Selected AdSets)
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {formatPKR(customBudget)} PKR
                  </span>
                </div>
                <input
                  type="range"
                  min="15000"
                  max="300000"
                  step="5000"
                  value={customBudget}
                  onChange={(e) => setCustomBudget(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Starter (Rs. 20K)</span>
                  <span>Recommended (Rs. 35K)</span>
                  <span>Scale (Rs. 150K+)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCreatives}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
              >
                <span>Lock Ad Sets & Strategy → Upload Media Creatives</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 5: CREATIVE UPLOAD, CURRENTLY RUNNING ADSETS SHOWCASE & CHECKOUT */}
          {step === 5 && !isTyping && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 mt-2 animate-fadeIn">
              {/* Creative Uploader with AI Quality & Missing Item Audit */}
              <CreativeUploader creatives={creatives} setCreatives={setCreatives} />

              {/* Live Ad Mockup Preview (FB Feed, Insta Feed, Reels 9:16 Video) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-1">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Campaigns & Ad Sets Preview (Facebook, Instagram & Reels)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Live Video Player
                  </span>
                </div>
                <AdMockupPreview
                  businessName={businessName || 'Your Brand'}
                  businessLogo={businessLogo}
                  adCopies={editableCopies}
                  adCopy={editableCopies[selectedAdCopyIndex] || editableCopies[0]}
                  creative={creatives[0]}
                  website={website || 'https://adpilot.pk'}
                  ctaType={editableCopies[selectedAdCopyIndex]?.callToAction || 'Order on Cash on Delivery'}
                />
              </div>

              {/* CURRENTLY ACTIVE RUNNING AD SETS SHOWCASE (Abhi Aapke Yeh Ad Sets Chalenge) */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Currently Active Running Ad Sets (Deployment Ready)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Abhi aapke yeh {adSets.filter((s) => s.selected).length} Ad Sets live Meta Marketing API par run hone ke liye tayyar hain:
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {formatPKR(customBudget)} Total Media Spend
                  </span>
                </div>

                <div className="space-y-2.5">
                  {adSets.filter((s) => s.selected).map((set, sIdx) => {
                    const selectedSets = adSets.filter((s) => s.selected)
                    const totalSplit = selectedSets.reduce((sum, s) => sum + (s.budgetSplit || 25), 0) || 100
                    const setShare = (set.budgetSplit || 25) / totalSplit
                    const setBudget = Math.round(customBudget * setShare)
                    const chosenHeadline = editableCopies[selectedAdCopyIndex]?.headline || 'High-Converting Offer'
                    const chosenCta = editableCopies[selectedAdCopyIndex]?.callToAction || 'Shop Now'
                    const hasVideos = creatives.some((c) => c.type === 'video')
                    const placementLabel = hasVideos ? 'Instagram & FB Reels' : 'Meta Feed (Images Only)'

                    return (
                      <div
                        key={set.id || sIdx}
                        className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/20">
                              AdSet #{sIdx + 1}
                            </span>
                            <span className="font-bold text-white text-xs">{set.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                              LIVE ON DEPLOY
                            </span>
                          </div>

                          <p className="text-[11px] text-indigo-200">
                            <b>Headline:</b> "{chosenHeadline}"
                          </p>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                            <span>📍 {set.locations}</span>
                            <span>•</span>
                            <span>🎯 {set.audience}</span>
                            <span>•</span>
                            <span className="text-cyan-300 font-medium">📦 {placementLabel}</span>
                          </div>
                        </div>

                        {/* Right: Budget Allocation */}
                        <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-slate-800 flex-shrink-0">
                          <div className="font-mono font-extrabold text-sm text-emerald-400">
                            {formatPKR(setBudget)} PKR
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {Math.round(setShare * 100)}% Share • CTA: {chosenCta}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Total Cost Calculation in PKR with 10% Platform Commission */}
              {(() => {
                const costs = calculateCampaignCosts(customBudget)
                return (
                  <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Total Direct Media Budget ({adSets.filter((s) => s.selected).length} Ad Sets):</span>
                      <span className="text-white font-semibold">{formatPKR(costs.adBudget)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <span>AdPilot Platform Commission ({costs.commissionRate}%):</span>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded">Retainer Model</span>
                      </span>
                      <span className="text-indigo-400 font-semibold">+{formatPKR(costs.commissionAmount)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-200">Total Due (Budget + Commission):</span>
                        <p className="text-[10px] text-slate-500">Processed securely via Safepay (PKR)</p>
                      </div>
                      <span className="text-lg font-extrabold text-emerald-400 font-mono">
                        {formatPKR(costs.totalAmount)} PKR
                      </span>
                    </div>
                  </div>
                )
              })()}

              <button
                type="button"
                onClick={handleFinalApprovalAndCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/30 group"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-200" />
                <span>Approve All {adSets.filter((s) => s.selected).length} Ad Sets & Deploy via Safepay (PKR)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Real-time Conversational Message Bar (Always Connected to Groq LLM) */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md flex-shrink-0">
          {/* Quick Prompt Pills */}
          <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wide flex-shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Quick Inputs:</span>
            </span>
            {step === 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Nova Studio, Mobile Action Games')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  🎮 Nova Studio (Mobile Games)
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Lumina Skincare, Organic Beauty Oils')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  🧴 Organic Skincare
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Pak Leather Crafters, Handcrafted Wallets')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  👜 Leather Wallets
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'TechVibe PK, Wireless Earbuds')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  📱 Tech Earbuds
                </button>
              </>
            )}
            {step === 2 && (
              <>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Summer Denim Jackets with Free Cash on Delivery')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  🧥 Denim Jackets (COD)
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Graphic Printed T-Shirts and Streetwear')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  👕 Graphic Tees
                </button>
              </>
            )}
            {step === 3 && (
              <>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Karachi, Lahore, Islamabad, Age 18-35, COD Buyers')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  📍 Metro Cities (Age 18-35)
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'All Pakistan Nationwide with Cash on Delivery')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  🇵🇰 Nationwide COD
                </button>
              </>
            )}
            {step >= 4 && (
              <>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Headline 1 ko thora Roman Urdu mein rewrite kardo')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  📝 Urdu Rewrite
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Targeting thori aur broad karo taake reach barhay')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  🎯 Broad Reach Tips
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChat(null, 'Cash on Delivery trust hook kaisa hai?')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 whitespace-nowrap transition-all"
                >
                  💬 COD Hook Advice
                </button>
              </>
            )}
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={
                  step === 1
                    ? "Type your business name & niche (e.g. Nova Studio, Mobile Games)..."
                    : step === 2
                      ? "Type your hero product (e.g. Summer Denim Jackets)..."
                      : step === 3
                        ? "Type target audience and Pakistani cities..."
                        : "Ask Groq AI any question or request copy adjustments in Roman Urdu/English..."
                }
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isChatSubmitting}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono hidden sm:inline">
                Enter ↵
              </span>
            </div>

            <button
              type="submit"
              disabled={!chatInput.trim() || isChatSubmitting}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all flex-shrink-0"
            >
              {isChatSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
