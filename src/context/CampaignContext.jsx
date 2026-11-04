import React, { createContext, useContext, useState, useEffect } from 'react'
import { getPaymentHistory } from '../services/safepay'

const CampaignContext = createContext(null)

const INITIAL_CAMPAIGNS = [
  {
    id: 'camp_01',
    name: 'Karachi & Lahore DTC Scale: Meta Feed Images',
    channels: ['Meta Feed (Images Only)'],
    placements: ['Meta Feed (Images Only)'],
    adSetName: 'Meta Feed Image AdSet',
    objective: 'E-commerce Conversions (COD)',
    status: 'Live',
    adBudget: 45000,
    commissionPaid: 4500,
    totalSpent: 32000,
    impressions: 148200,
    clicks: 4890,
    ctr: '3.3%',
    conversions: 342,
    cpa: 'Rs. 93',
    revenue: 138000,
    roas: '4.3x',
    creativesCount: 3,
    createdDate: '2026-10-18',
    aiStatus: 'Feed Creative #1 scaling • Reels disabled (Images only)'
  },
  {
    id: 'camp_02',
    name: 'Nationwide Cash on Delivery: Meta Feed & Carousels',
    channels: ['Meta Feed (Images Only)'],
    placements: ['Meta Feed (Images Only)'],
    adSetName: 'Meta Carousel Image AdSet',
    objective: 'Direct WhatsApp & Web Sales',
    status: 'Optimizing',
    adBudget: 30000,
    commissionPaid: 3000,
    totalSpent: 21500,
    impressions: 82100,
    clicks: 2850,
    ctr: '3.8%',
    conversions: 184,
    cpa: 'Rs. 116',
    revenue: 94500,
    roas: '4.4x',
    creativesCount: 2,
    createdDate: '2026-10-22',
    aiStatus: 'Optimizing image contrast & CTA reach'
  },
  {
    id: 'camp_03',
    name: 'Viral Founder Story: Instagram Reels (Video)',
    channels: ['Instagram Reels (9:16 Video)'],
    placements: ['Instagram Reels (9:16 Video)'],
    adSetName: 'Viral Reels Video AdSet',
    objective: 'Brand Traffic & Sales',
    status: 'Paused',
    adBudget: 25000,
    commissionPaid: 2500,
    totalSpent: 25000,
    impressions: 210400,
    clicks: 8900,
    ctr: '4.2%',
    conversions: 112,
    cpa: 'Rs. 223',
    revenue: 58000,
    roas: '2.3x',
    creativesCount: 1,
    createdDate: '2026-10-05',
    aiStatus: 'Video creative fatigue detected. Ready for refresh'
  }
]

export function CampaignProvider({ children }) {
  const [campaigns, setCampaigns] = useState(() => {
    const cached = localStorage.getItem('adpilot_campaigns')
    return cached ? JSON.parse(cached) : INITIAL_CAMPAIGNS
  })

  const [paymentHistory, setPaymentHistory] = useState([])
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'campaigns' | 'retainer' | 'ai-bot'
  const [showAiChatbot, setShowAiChatbot] = useState(false)
  const [checkoutModalData, setCheckoutModalData] = useState(null)

  // Retainer management state in Pakistani Rupees (PKR)
  const [retainer, setRetainer] = useState({
    tier: 'Growth Autopilot Pro (Pakistan)',
    monthlyFee: 35000,
    currency: 'PKR',
    currencySymbol: 'Rs.',
    commissionRate: 10,
    billingCycle: 'Monthly (Automated via Safepay)',
    nextBillingDate: '2026-11-28',
    status: 'Active',
    rolloverBudget: 8500.00,
    allocatedThisMonth: 85000.00,
    aiOptimizationLevel: 'Maximum Autopilot (Aggressive ROAS)'
  })

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('adpilot_campaigns', JSON.stringify(campaigns))
    setPaymentHistory(getPaymentHistory())
  }, [campaigns])

  const addCampaign = (newCampaign) => {
    setCampaigns((prev) => [newCampaign, ...prev])
  }

  const toggleCampaignStatus = (id) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'Live' ? 'Paused' : 'Live'
          return { ...c, status: nextStatus }
        }
        return c
      })
    )
  }

  const refreshPayments = () => {
    setPaymentHistory(getPaymentHistory())
  }

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        addCampaign,
        toggleCampaignStatus,
        paymentHistory,
        refreshPayments,
        retainer,
        setRetainer,
        activeTab,
        setActiveTab,
        showAiChatbot,
        setShowAiChatbot,
        checkoutModalData,
        setCheckoutModalData
      }}
    >
      {children}
    </CampaignContext.Provider>
  )
}

export function useCampaign() {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaign must be used within a CampaignProvider')
  }
  return context
}
