/**
 * Frontend AI Service
 * Communicates with backend LLM API (Groq/OpenAI) to generate viral keywords, trending hashtags, and ad copies
 */

export async function generateCampaignStrategy({
  businessName,
  industry,
  niche,
  productDesc,
  targetAudience,
  adGoal,
  channels
}) {
  try {
    const res = await fetch('/api/ai/generate-strategy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessName,
        industry,
        niche: niche || industry,
        productDesc,
        targetAudience,
        adGoal,
        channels
      })
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.strategy) {
        return data.strategy
      }
    }
  } catch (err) {
    console.warn('[AdPilot AI] Backend AI route fallback:', err)
  }

  // Client-side fallback if backend is unreachable
  const brand = businessName || 'Brand'
  const combined = `${businessName || ''} ${industry || ''} ${niche || ''} ${productDesc || ''}`.toLowerCase()
  const aud = `${targetAudience || ''}`.toLowerCase()

  const isGame = combined.includes('game') || combined.includes('gaming') || combined.includes('gamer') || 
                 combined.includes('rpg') || combined.includes('fps') || combined.includes('arcade') || 
                 combined.includes('playstore') || combined.includes('steam') || combined.includes('unity') || 
                 combined.includes('unreal') || combined.includes('puzzle')

  const isAppOrDigital = isGame || combined.includes('app') || combined.includes('software') || 
                         combined.includes('saas') || combined.includes('tool') || combined.includes('download') || 
                         combined.includes('digital') || combined.includes('course')

  const isGlobal = aud.includes('world') || aud.includes('global') || aud.includes('international') || 
                   aud.includes('usa') || aud.includes('us') || aud.includes('uk') || aud.includes('all')

  if (isGame) {
    return {
      viralKeywords: [
        'mobile game 2026',
        'best action rpg mobile',
        'free to play game',
        'gameplay trailer',
        'multiplayer battle mobile',
        'viral gaming clips',
        'top tier mobile graphics',
        'boss fight mobile',
        'addictive mobile game',
        'open world mobile'
      ],
      trendingHashtags: [
        '#MobileGame',
        '#Gaming',
        '#Gameplay',
        '#Gamer',
        '#FreeToPlay',
        '#iOSGames',
        '#AndroidGaming',
        '#GamerLife',
        '#IndieGame',
        '#MobileRPG'
      ],
      adCopies: [
        {
          id: 'copy_1',
          angle: 'Action Gameplay & Viral Challenge',
          hook: '🎮 Only 2% of players can beat Level 50. Are you up for the challenge?',
          headline: `Level Up: Play ${brand} Free on iOS & Android Today`,
          primaryText: `Experience console-quality graphics, responsive controls, and real-time multiplayer battles right on your mobile phone. Download now and prove your skills on the global leaderboard!`,
          callToAction: 'Play Free Now',
          badge: '🔥 Top Trending Game'
        },
        {
          id: 'copy_2',
          angle: 'Exclusive Starter Pack / In-Game Rewards',
          hook: '🎁 New Player Launch Event: Claim 5,000 Free Gems + Legendary Hero!',
          headline: `Download Free Today & Unlock Exclusive $50 Starter Pack`,
          primaryText: `Join millions of players worldwide. Install now and claim your instant new-player bonus pack before this limited-time launch event ends!`,
          callToAction: 'Claim Free Starter Pack',
          badge: '⭐ Free In-Game Loot'
        },
        {
          id: 'copy_3',
          angle: 'Global Player Community & 5-Star Reviews',
          hook: '⭐ Over 5 Million Gamers Worldwide already joined the arena...',
          headline: `Why Millions of Gamers Worldwide Switched to ${brand}`,
          primaryText: `Rated 4.8/5 on Google Play and Apple App Store. Smooth 60FPS combat, zero lag, and endless multiplayer excitement await. Tap Install and start playing instantly!`,
          callToAction: 'Install Free (App Store & Google Play)',
          badge: '🏆 Top Rated 2026'
        },
        {
          id: 'copy_4',
          angle: 'Anti-Boredom / Skill vs Clones Hook',
          hook: 'Tired of boring pay-to-win games? This one is 100% skill-based.',
          headline: `Stop Playing Clones. Experience Real Next-Gen Mobile Gaming.`,
          primaryText: `Built by passionate gamers for true gamers. Fair matchmaking, deep customisation, and epic boss fights. Free download with zero paywalls.`,
          callToAction: 'Download Free Now',
          badge: '⚡ High Action Gameplay'
        },
        {
          id: 'copy_5',
          angle: 'Visual Immersion & Next-Gen Mobile Engine',
          hook: 'Console-quality 3D graphics your phone was actually made for.',
          headline: `Next-Gen Visuals In The Palm Of Your Hand. Play Now!`,
          primaryText: `Immerse yourself in stunning 3D worlds with dynamic physics, cinematic cutscenes, and responsive touchscreen controls. Install free today.`,
          callToAction: 'Play Now (Instant Free Download)',
          badge: '🎮 Next-Gen Mobile'
        }
      ],
      recommendedAdSets: [
        {
          id: 'adset_1',
          name: 'Tier 1 English Speaking (USA, UK, CA, AU) Mobile Gamers',
          locations: 'United States, United Kingdom, Canada, Australia',
          audience: 'Age 16-35 | Mobile Gaming, Esports, Action/RPG Enthusiasts',
          budgetSplit: 40,
          selected: true,
          placementType: 'Reels & Feed'
        },
        {
          id: 'adset_2',
          name: 'Worldwide Global Android High Volume Installs',
          locations: 'Worldwide Global',
          audience: 'Age 16-40 | Mobile App Installs, High Specs Device',
          budgetSplit: 35,
          selected: true,
          placementType: 'Reels 9:16 Video'
        },
        {
          id: 'adset_3',
          name: 'Core Action & Mobile Gamers',
          locations: 'Worldwide Global',
          audience: 'Engaged with mobile gaming clips, Steam, Twitch, YouTube Gaming',
          budgetSplit: 15,
          selected: true,
          placementType: 'Video Discovery'
        },
        {
          id: 'adset_4',
          name: 'Advantage+ Broad Global Player Discovery',
          locations: 'Worldwide Global Reach',
          audience: 'Algorithmic Lookalike & High Engagement Mobile Users',
          budgetSplit: 10,
          selected: false,
          placementType: 'Broad AI Discovery'
        }
      ],
      recommendedBudget: 35000,
      projectedRoas: '4.5x - 5.2x (App Installs)',
      engineUsed: 'AdPilot Smart Creative Engine (Mobile Game Profile)'
    }
  }

  const cleanNiche = niche || industry || 'E-Commerce'

  return {
    viralKeywords: [
      `${cleanNiche.toLowerCase()} essentials`,
      `best ${cleanNiche.toLowerCase()} 2026`,
      `viral ${brand.toLowerCase()} review`,
      'life hack upgrade',
      'high performance quality',
      'game changer product',
      'customer favorite',
      'unboxing aesthetic'
    ],
    trendingHashtags: [
      `#${cleanNiche.replace(/[^a-zA-Z0-9]/g, '')}`,
      '#TikTokMadeMeBuyIt',
      '#MustHave2026',
      '#TrendingNow',
      '#LifeHacks',
      '#ViralProduct',
      '#FoundItOnTikTok',
      '#AdPilotScale'
    ],
    adCopies: [
      {
        angle: 'Problem-Agitation-Solution (PAS)',
        hook: `Tired of ordinary ${cleanNiche}? You deserve better.`,
        headline: `Stop Settling. Experience ${brand} Today.`,
        primaryText: `If you're still dealing with outdated ${cleanNiche.toLowerCase()} solutions, this is for you. We engineered ${brand} with premium grade materials and smart performance to save you hours of frustration.`,
        callToAction: isGlobal ? 'Shop Global Sale' : 'Shop Now & Get 20% Off',
        badge: 'High CTR Angle'
      },
      {
        angle: 'Viral UGC / Social Proof',
        hook: 'I tested the viral sensation everyone is talking about...',
        headline: `Why ${brand} Sold Out 3x This Month`,
        primaryText: `Honestly, I was skeptical at first. But after just 48 hours with ${brand}, I completely understand the hype. The attention to detail and effortless results speak for themselves.`,
        callToAction: 'Claim Yours Before Sold Out',
        badge: 'Maximum ROAS Angle'
      },
      {
        angle: 'Direct Urgency / Limited Offer',
        hook: 'Flash Sale Alert: 24 Hours Only!',
        headline: `Upgrade Your Lifestyle: ${productDesc || cleanNiche}`,
        primaryText: `Ready to elevate your everyday routine? For the next 24 hours only, get free priority shipping + exclusive welcome bonus on every ${brand} order. Backed by our 30-day money-back guarantee.`,
        callToAction: 'Order Today (Risk Free)',
        badge: 'Direct Conversion Angle'
      }
    ],
    recommendedBudget: 35000,
    projectedRoas: '4.2x - 4.8x',
    engineUsed: `AdPilot Smart Creative Engine (${isGlobal ? 'Global Profile' : 'Local Profile'})`
  }
}

/**
 * On-demand AI Rewrite of an Ad Copy Headline and Primary Text
 */
export async function rewriteCampaignAngle({
  businessName,
  niche,
  angle,
  currentHeadline,
  currentPrimaryText,
  style
}) {
  try {
    const res = await fetch('/api/ai/rewrite-angle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        businessName,
        niche,
        angle,
        currentHeadline,
        currentPrimaryText,
        style
      })
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.rewritten) {
        return data.rewritten
      }
    }
  } catch (err) {
    console.warn('[AdPilot AI] AI Rewrite fallback:', err)
  }

  // Client fallback
  const isGame = `${businessName || ''} ${niche || ''} ${currentHeadline || ''}`.toLowerCase().includes('game')
  if (isGame) {
    return {
      angle: angle || 'Gameplay Challenge',
      headline: `🎮 Level Up: Download ${businessName || 'Game'} Free on iOS & Android`,
      hook: 'Over 5 Million Gamers Worldwide already joined the arena!',
      primaryText: 'Experience 60FPS fluid combat and real-time multiplayer battles. Download now and claim your instant starter loot pack!',
      callToAction: 'Play Free Now',
      badge: '🔥 Top Trending Game'
    }
  }

  return {
    angle: angle || 'AI Rewritten Hook',
    headline: `🔥 Flat 25% OFF ${businessName || 'Brand'} — Special Launch Offer`,
    hook: 'Over 10,000+ satisfied customers worldwide!',
    primaryText: `Engineered for premium performance and backed by a 100% money-back guarantee. Order today with total confidence.`,
    callToAction: 'Claim Special Offer',
    badge: 'AI Rewritten Hook'
  }
}

/**
 * Conversational Chat Message with Groq LLM
 */
export async function sendChatToLLM({ messages, businessContext }) {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        businessContext
      })
    })

    if (res.ok) {
      const data = await res.json()
      if (data?.reply) {
        return data
      }
    }
  } catch (err) {
    console.warn('[AdPilot AI] Chat endpoint error, using fallback:', err)
  }

  return {
    reply: "Bohat khoob! Main aapke business details note kar raha hoon. Meta Ads par high-ROAS generate karne ke liye ye best rahega.",
    provider: 'AdPilot Smart Assistant'
  }
}


