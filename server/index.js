import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { generateAdStrategyWithLLM, rewriteAdCopyAngleWithLLM, chatWithLLM } from './aiService.js'
import { createSafepayOrder, verifySafepayOrder, calculateCampaignTotals } from './safepayService.js'
import { 
  createMetaCampaign, 
  createMetaAdSet, 
  updateMetaCampaignStatus, 
  updateMetaCampaignBudget, 
  getMetaCampaignInsights,
  isMetaConfigured
} from './metaService.js'

dotenv.config()

export const app = express()

app.use(cors())
app.use(express.json())

/**
 * Health check & configuration status
 */
app.get('/api/health', (req, res) => {
  const hasGroq = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key_here')
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here')
  const hasSafepay = Boolean(process.env.SAFEPAY_API_KEY && process.env.SAFEPAY_API_KEY !== 'sec_sandbox_example_key')
  const metaConfigured = isMetaConfigured()

  res.json({
    status: 'online',
    service: 'AdPilot AI Backend API',
    llmProvider: hasGroq ? 'Groq (openai/gpt-oss-120b)' : (hasOpenAI ? 'OpenAI (gpt-4o-mini)' : 'AdPilot Creative Engine'),
    safepayMode: 'Sandbox',
    metaStatus: metaConfigured ? 'Meta Graph API v21.0 (Live)' : 'Meta Sandbox Simulator Active',
    commissionPercent: Number(process.env.VITE_PLATFORM_COMMISSION_PERCENT) || 10
  })
})

/**
 * AI Strategy & Copy Generation Endpoint (Groq / OpenAI)
 */
app.post('/api/ai/generate-strategy', async (req, res) => {
  try {
    const { businessName, industry, niche, productDesc, targetAudience, adGoal, channels } = req.body

    const strategy = await generateAdStrategyWithLLM({
      businessName,
      industry,
      niche,
      productDesc,
      targetAudience,
      adGoal,
      channels
    })

    res.json({
      success: true,
      strategy
    })
  } catch (err) {
    console.error('Error generating AI strategy:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate ad strategy'
    })
  }
})

/**
 * AI Headline & Copy Rewrite Endpoint (Groq / OpenAI)
 */
app.post('/api/ai/rewrite-angle', async (req, res) => {
  try {
    const { businessName, niche, angle, currentHeadline, currentPrimaryText, style } = req.body

    const rewritten = await rewriteAdCopyAngleWithLLM({
      businessName,
      niche,
      angle,
      currentHeadline,
      currentPrimaryText,
      style
    })

    res.json({
      success: true,
      rewritten
    })
  } catch (err) {
    console.error('Error rewriting ad copy:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to rewrite ad copy'
    })
  }
})

/**
 * Conversational AI Chat Endpoint (Groq LLM)
 */
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, businessContext } = req.body

    const response = await chatWithLLM({
      messages: messages || [],
      businessContext: businessContext || {}
    })

    res.json({
      success: true,
      ...response
    })
  } catch (err) {
    console.error('Error in AI chat endpoint:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'AI chat failed'
    })
  }
})

/**
 * Safepay Sandbox Order Initialization
 */
app.post('/api/safepay/init-checkout', async (req, res) => {
  try {
    const { adBudget, commissionPercent, customer, campaignDetails } = req.body
    const origin = req.headers.origin || 'http://127.0.0.1:5173'

    const order = await createSafepayOrder({
      adBudget,
      commissionPercent: commissionPercent || Number(process.env.VITE_PLATFORM_COMMISSION_PERCENT) || 10,
      customer,
      campaignDetails,
      origin
    })

    res.json(order)
  } catch (err) {
    console.error('Error initializing Safepay checkout:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to initialize Safepay checkout'
    })
  }
})

/**
 * Safepay Sandbox Verification & Callback Validation
 */
app.post('/api/safepay/verify-payment', async (req, res) => {
  try {
    const { tracker, referenceId, status } = req.body

    const result = await verifySafepayOrder({
      tracker,
      referenceId,
      status
    })

    res.json(result)
  } catch (err) {
    console.error('Error verifying Safepay payment:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Payment verification failed'
    })
  }
})

/* ==========================================================================
   META MARKETING API (GRAPH API v21.0) ENDPOINTS
   ========================================================================== */

/**
 * Deploy Campaign to Meta Marketing API
 */
app.post('/api/meta/create-campaign', async (req, res) => {
  try {
    const { name, objective, dailyBudget, targeting } = req.body

    const campaign = await createMetaCampaign({
      name: name || 'AdPilot AI Automated Campaign',
      objective: objective || 'OUTCOME_SALES',
      status: 'ACTIVE'
    })

    const adSet = await createMetaAdSet({
      campaignId: campaign.metaCampaignId,
      name: name || 'AdPilot AI AdSet',
      dailyBudget: dailyBudget || 50,
      targeting: targeting || {}
    })

    res.json({
      success: true,
      metaCampaignId: campaign.metaCampaignId,
      metaAdSetId: adSet.metaAdSetId,
      mode: campaign.mode,
      message: 'Campaign and AdSet successfully created via Meta Marketing API'
    })
  } catch (err) {
    console.error('Error deploying to Meta:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to deploy to Meta'
    })
  }
})

/**
 * Meta Campaign Status Maintenance (Pause / Resume)
 */
app.post('/api/meta/update-status', async (req, res) => {
  try {
    const { campaignId, status } = req.body // status: 'ACTIVE' | 'PAUSED'

    const result = await updateMetaCampaignStatus({
      campaignId,
      status
    })

    res.json(result)
  } catch (err) {
    console.error('Error updating Meta status:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update campaign status on Meta'
    })
  }
})

/**
 * Meta Budget Maintenance (Dynamic Auto-Bidding / Rebalance)
 */
app.post('/api/meta/update-budget', async (req, res) => {
  try {
    const { adSetId, newBudget } = req.body

    const result = await updateMetaCampaignBudget({
      adSetId,
      newBudget
    })

    res.json(result)
  } catch (err) {
    console.error('Error updating Meta budget:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to update budget on Meta'
    })
  }
})

/**
 * Meta Graph Performance Insights & Charts
 */
app.get('/api/meta/insights', async (req, res) => {
  try {
    const campaignId = req.query.campaignId
    const datePreset = req.query.datePreset || 'last_30d'

    const insights = await getMetaCampaignInsights({
      campaignId,
      datePreset
    })

    res.json(insights)
  } catch (err) {
    console.error('Error fetching Meta insights:', err)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch Meta insights'
    })
  }
})

// If run directly via `node server/index.js`
import { fileURLToPath } from 'url'
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isDirectRun) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`[AdPilot AI Server] Running on http://localhost:${PORT}`)
  })
}
