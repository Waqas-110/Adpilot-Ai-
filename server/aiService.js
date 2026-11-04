import dotenv from 'dotenv'
dotenv.config()

/**
 * Intelligent Profile Detector:
 * Identifies whether the product is a Mobile Game, Digital App, or Physical eCommerce,
 * and whether the audience is Global / Worldwide or Local Pakistan.
 */
export function detectCampaignProfile({ businessName, industry, niche, productDesc, targetAudience }) {
  const combined = `${businessName || ''} ${industry || ''} ${niche || ''} ${productDesc || ''}`.toLowerCase()
  const aud = `${targetAudience || ''}`.toLowerCase()

  const isGame = combined.includes('game') || combined.includes('gaming') || combined.includes('gamer') || 
                 combined.includes('rpg') || combined.includes('fps') || combined.includes('arcade') || 
                 combined.includes('playstore') || combined.includes('steam') || combined.includes('unity') || 
                 combined.includes('unreal') || combined.includes('puzzle')

  const isAppOrDigital = isGame || combined.includes('app') || combined.includes('software') || 
                         combined.includes('saas') || combined.includes('tool') || combined.includes('download') || 
                         combined.includes('subscription') || combined.includes('digital') || combined.includes('course')

  const isGlobal = aud.includes('world') || aud.includes('global') || aud.includes('international') || 
                   aud.includes('usa') || aud.includes('us') || aud.includes('uk') || aud.includes('all') || 
                   aud.includes('tier 1') || aud.includes('tier-1') || aud.includes('europe') || aud.includes('asia')

  return { isGame, isAppOrDigital, isGlobal }
}

/**
 * Intelligent Fallback Generator for when API keys are not yet configured or offline.
 * Dynamically adapts to Mobile Games, Worldwide audiences, Digital Apps, and physical eCommerce.
 */
export function generateLocalFallbackCreatives({ businessName, industry, niche, productDesc, targetAudience, adGoal }) {
  const brand = businessName || 'AdPilot Brand'
  const cleanNiche = niche || industry || 'E-Commerce'
  const { isGame, isAppOrDigital, isGlobal } = detectCampaignProfile({ businessName, industry, niche, productDesc, targetAudience })

  // --------------------------------------------------------------------------
  // PROFILE 1: MOBILE GAMES (Worldwide or Regional)
  // --------------------------------------------------------------------------
  if (isGame) {
    const viralKeywords = [
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
    ]

    const trendingHashtags = [
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
    ]

    const adCopies = [
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
    ]

    const recommendedAdSets = [
      {
        id: 'adset_1',
        name: 'Tier 1 English Speaking (USA, UK, Canada, Australia)',
        locations: 'United States, United Kingdom, Canada, Australia',
        audience: 'Age 16-35 | Mobile Gaming, Esports, RPG/Action Enthusiasts',
        budgetSplit: 40,
        selected: true,
        placementType: 'Reels & Feed'
      },
      {
        id: 'adset_2',
        name: 'Worldwide Global Android High Volume',
        locations: isGlobal ? 'Worldwide (Top Gaming Tier Geos)' : 'Target Gaming Markets',
        audience: 'Age 16-40 | Mobile App Installs, High Device Specs',
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
    ]

    return {
      viralKeywords,
      trendingHashtags,
      adCopies,
      recommendedAdSets,
      targetAudienceAngles: [
        'Global mobile gamers on iOS and Android seeking competitive action',
        'Casual and core players responsive to free starter pack rewards',
        'Esports and community-driven mobile players worldwide'
      ],
      recommendedBudget: 35000,
      projectedRoas: '4.5x - 5.2x (App Installs)',
      engineUsed: 'AdPilot Intelligent Creative Engine (Mobile Game Profile)'
    }
  }

  // --------------------------------------------------------------------------
  // PROFILE 2: DIGITAL APPS & SAAS (Worldwide or Local)
  // --------------------------------------------------------------------------
  if (isAppOrDigital) {
    const viralKeywords = [
      `${cleanNiche.toLowerCase()} app`,
      'best productivity app 2026',
      'mobile app download free',
      'free software trial',
      'life hack app',
      'smart automated tool',
      'top rated app 2026',
      'cloud platform app'
    ]

    const trendingHashtags = [
      `#${cleanNiche.replace(/[^a-zA-Z0-9]/g, '')}`,
      '#AppStore',
      '#Productivity',
      '#TechHacks',
      '#MustHaveApp',
      '#SaaS',
      '#Software',
      '#LifeHacks'
    ]

    const adCopies = [
      {
        id: 'copy_1',
        angle: 'Instant Productivity & Feature Hook',
        hook: `Save 5+ hours every week with the smart new ${brand} app.`,
        headline: `Upgrade Your Workflow: Try ${brand} Free Today`,
        primaryText: `Join 100,000+ users worldwide who simplified their daily routine. Download free and unlock all pro features with zero credit card required!`,
        callToAction: 'Get Started Free',
        badge: '⚡ High Efficiency'
      },
      {
        id: 'copy_2',
        angle: 'Social Proof & 5-Star Rating',
        hook: `Over 10,000+ 5-star ratings on App Store & Google Play...`,
        headline: `Why Everyone Is Switching to ${brand} This Month`,
        primaryText: `Rated 4.9/5 by industry leaders. Seamless cloud sync, intuitive UI, and lightning speed. Install now and see why users love it!`,
        callToAction: 'Download Free App',
        badge: '🏆 Top Rated App'
      },
      {
        id: 'copy_3',
        angle: 'Limited Free Access / Welcome Bonus',
        hook: 'Exclusive launch offer: 30 days of Premium unlocked free!',
        headline: `Claim Your Free 30-Day VIP Pass to ${brand}`,
        primaryText: `Experience full power without limitations. Fast setup in under 60 seconds. Tap below to claim your access now.`,
        callToAction: 'Claim Free Pass',
        badge: '🎁 Limited Bonus'
      },
      {
        id: 'copy_4',
        angle: 'Problem-Agitation-Solution (PAS)',
        hook: 'Tired of complicated, clunky tools? There is a better way.',
        headline: `Stop Wasting Time on Clunky Software. Use ${brand}.`,
        primaryText: `Engineered from the ground up for speed and simplicity. Available on iOS, Android, and Web. Get started in seconds.`,
        callToAction: 'Try Free Now',
        badge: 'High CTR'
      },
      {
        id: 'copy_5',
        angle: 'Executive & Pro Elevation',
        hook: 'The modern professional choice for next-generation efficiency.',
        headline: `Experience Real Innovation with ${brand}`,
        primaryText: `Loved by creators, entrepreneurs, and busy professionals around the globe. Download free today.`,
        callToAction: 'Install Free Today',
        badge: 'Pro Tier'
      }
    ]

    const recommendedAdSets = [
      {
        id: 'adset_1',
        name: isGlobal ? 'Global Tier 1 (US, UK, CA, AU) Tech Users' : 'Urban Metro Power Users',
        locations: isGlobal ? 'United States, United Kingdom, Canada' : 'Metro Cities',
        audience: 'Age 20-45 | Productivity, Tech Tools, Mobile Apps',
        budgetSplit: 40,
        selected: true,
        placementType: 'Feed & Stories'
      },
      {
        id: 'adset_2',
        name: 'Broad App Install Optimization',
        locations: isGlobal ? 'Worldwide Global' : 'Pakistan Nationwide',
        audience: 'Age 18-50 | Mobile App Downloads, Digital Shoppers',
        budgetSplit: 35,
        selected: true,
        placementType: 'Reels 9:16 Video'
      },
      {
        id: 'adset_3',
        name: 'Website & App Retargeting Pool',
        locations: isGlobal ? 'Global Retargeting' : 'Nationwide',
        audience: 'Engaged with landing page in last 30 days',
        budgetSplit: 15,
        selected: true,
        placementType: 'Retargeting Feed'
      },
      {
        id: 'adset_4',
        name: 'Advantage+ AI Lookalike Audience',
        locations: isGlobal ? 'Worldwide' : 'Nationwide',
        audience: 'Algorithmic Lookalike of Top Active App Users',
        budgetSplit: 10,
        selected: false,
        placementType: 'Broad AI Discovery'
      }
    ]

    return {
      viralKeywords,
      trendingHashtags,
      adCopies,
      recommendedAdSets,
      targetAudienceAngles: [
        'Global mobile and web users seeking time-saving solutions',
        'Tech-forward professionals responsive to free trial incentives'
      ],
      recommendedBudget: 35000,
      projectedRoas: '4.2x - 4.8x',
      engineUsed: 'AdPilot Intelligent Creative Engine (Digital App Profile)'
    }
  }

  // --------------------------------------------------------------------------
  // PROFILE 3: PHYSICAL E-COMMERCE (Global Worldwide or Pakistan Local)
  // --------------------------------------------------------------------------
  const viralKeywords = [
    `${cleanNiche.toLowerCase()} essentials`,
    `best ${cleanNiche.toLowerCase()} 2026`,
    `viral ${brand.toLowerCase()} review`,
    'life hack upgrade',
    'high performance quality',
    'game changer product',
    'customer favorite',
    'unboxing aesthetic'
  ]

  const cleanTag = cleanNiche.replace(/[^a-zA-Z0-9]/g, '')
  const trendingHashtags = [
    `#${cleanTag}`,
    `#${cleanTag}Community`,
    '#TikTokMadeMeBuyIt',
    '#MustHave2026',
    '#TrendingNow',
    '#LifeHacks',
    '#ViralProduct',
    '#FoundItOnTikTok',
    '#AdPilotScale',
    `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`
  ]

  const adCopies = [
    {
      id: 'copy_1',
      angle: 'Direct Urgency / Flash Discount',
      hook: 'Flash Sale Alert: Flat 25% OFF for the next 24 hours only!',
      headline: isGlobal 
        ? `Limited Time Drop: 25% OFF ${brand} + Worldwide Express Shipping`
        : `Limited Time Drop: 25% OFF ${brand} + Free Delivery Across Pakistan`,
      primaryText: `Don't miss out on customer-favorite ${cleanNiche.toLowerCase()}. Handcrafted with premium materials and backed by a 30-day money-back guarantee. Order today before stock runs out!`,
      callToAction: 'Shop Flash Sale Now',
      badge: 'High Conversion Angle'
    },
    {
      id: 'copy_2',
      angle: isGlobal ? '100% Risk-Free Guarantee & Fast Shipping' : 'Cash on Delivery (COD) & Risk-Free Trust',
      hook: isGlobal 
        ? 'Shop with 100% confidence — 30-day no-questions-asked guarantee!'
        : 'Order with 100% confidence — open parcel before paying!',
      headline: isGlobal
        ? `100% Money-Back Guarantee | Worldwide Fast Shipping`
        : `Cash on Delivery Available Nationwide | Risk-Free Order`,
      primaryText: isGlobal
        ? `Shop with peace of mind. Every ${brand} order comes with express tracked delivery and dedicated 24/7 customer support.`
        : `Worried about online shopping? With ${brand}, you pay when your parcel arrives at your doorstep. 100% genuine quality guaranteed with instant WhatsApp support.`,
      callToAction: isGlobal ? 'Shop Risk-Free Now' : 'Order on Cash on Delivery',
      badge: 'Maximum Trust Angle'
    },
    {
      id: 'copy_3',
      angle: 'Viral UGC / Social Proof',
      hook: isGlobal
        ? 'Over 10,000+ satisfied customers around the globe...'
        : 'Over 10,000+ satisfied customers across Karachi, Lahore & Islamabad...',
      headline: `Why 10,000+ Shoppers Switched to ${brand} This Month`,
      primaryText: `Honestly, we were amazed by the customer love! After switching to ${brand}, 98% of buyers rated us 5 stars for durability and fast delivery. See the difference for yourself today.`,
      callToAction: 'Read Reviews & Buy Now',
      badge: 'High ROAS Angle'
    },
    {
      id: 'copy_4',
      angle: 'Problem-Agitation-Solution (PAS)',
      hook: `Tired of ordinary ${cleanNiche}? You deserve better.`,
      headline: `Stop Settling for Cheap Copies. Experience Real ${brand}.`,
      primaryText: `If you're still dealing with substandard ${cleanNiche.toLowerCase()} that breaks in weeks, this is for you. We engineered ${brand} with premium grade materials to last for years.`,
      callToAction: 'Upgrade Your Daily Essentials',
      badge: 'High CTR Angle'
    },
    {
      id: 'copy_5',
      angle: 'VIP Lifestyle & Premium Elevation',
      hook: 'Elevate your daily routine with handcrafted luxury.',
      headline: `The Modern Choice: ${productDesc || cleanNiche}`,
      primaryText: `Designed for those who appreciate fine aesthetics and seamless functionality. Enjoy complimentary express delivery and luxury gift packaging on every order.`,
      callToAction: 'Claim Your VIP Package',
      badge: 'Premium Brand Angle'
    }
  ]

  const recommendedAdSets = isGlobal ? [
    {
      id: 'adset_1',
      name: 'Tier 1 Global High-Intent Buyers (USA, UK, CA, AU)',
      locations: 'United States, United Kingdom, Canada, Australia',
      audience: 'Age 22-45 | Online Shopping & Premium Quality Goods',
      budgetSplit: 40,
      selected: true,
      placementType: 'Feed & Stories'
    },
    {
      id: 'adset_2',
      name: 'Worldwide Global E-Commerce Reach',
      locations: 'Worldwide Global',
      audience: 'Age 18-50 | Online Shoppers, Fast Checkout, Discount Deals',
      budgetSplit: 35,
      selected: true,
      placementType: 'Feed Images Only'
    },
    {
      id: 'adset_3',
      name: 'Global Social Retargeting Pool',
      locations: 'Worldwide Global',
      audience: 'Engaged with Instagram/Facebook page or website in last 30 days',
      budgetSplit: 15,
      selected: true,
      placementType: 'Retargeting Feed'
    },
    {
      id: 'adset_4',
      name: 'Advantage+ Broad Global Discovery',
      locations: 'Worldwide Global',
      audience: 'Algorithmic Lookalike & High ROAS Broad Audience',
      budgetSplit: 10,
      selected: false,
      placementType: 'Broad AI Discovery'
    }
  ] : [
    {
      id: 'adset_1',
      name: 'Metro Cities High-Intent Shoppers',
      locations: 'Karachi, Lahore, Islamabad, Rawalpindi',
      audience: 'Age 22-45 | Online Shopping & Premium Accessories',
      budgetSplit: 40,
      selected: true,
      placementType: 'Feed & Story'
    },
    {
      id: 'adset_2',
      name: 'Nationwide Cash on Delivery (COD) Shoppers',
      locations: 'All Pakistan (Faisalabad, Multan, Peshawar, Sialkot & Tier-2)',
      audience: 'Age 18-50 | COD Buyers, Discount Deals, Fast Shipping',
      budgetSplit: 35,
      selected: true,
      placementType: 'Feed Images Only'
    },
    {
      id: 'adset_3',
      name: 'Social Engagement & Retargeting',
      locations: 'Pakistan Nationwide',
      audience: 'Engaged with Instagram/Facebook page or website in last 30 days',
      budgetSplit: 15,
      selected: true,
      placementType: 'Retargeting Feed'
    },
    {
      id: 'adset_4',
      name: 'Advantage+ Broad Viral Discovery',
      locations: 'Pakistan Nationwide',
      audience: 'Algorithmic Lookalike & High ROAS Broad Audience',
      budgetSplit: 10,
      selected: false,
      placementType: 'Broad AI Discovery'
    }
  ]

  return {
    viralKeywords,
    trendingHashtags,
    adCopies,
    recommendedAdSets,
    targetAudienceAngles: [
      `High-intent ${cleanNiche} buyers searching for premium quality`,
      isGlobal ? 'Global cross-border online shoppers' : 'Mobile-first shoppers responsive to direct WhatsApp & COD checkout',
      'Value-driven customers motivated by limited-time promotional offers'
    ],
    recommendedBudget: 35000,
    projectedRoas: '4.2x - 4.9x',
    engineUsed: `AdPilot Intelligent Creative Engine (${isGlobal ? 'Global Profile' : 'Local Profile'})`
  }
}

/**
 * Generate viral ad strategy via Groq or OpenAI API
 */
export async function generateAdStrategyWithLLM({
  businessName,
  industry,
  niche,
  productDesc,
  targetAudience,
  adGoal,
  channels
}) {
  const groqApiKey = process.env.GROQ_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  const { isGame, isAppOrDigital, isGlobal } = detectCampaignProfile({ businessName, industry, niche, productDesc, targetAudience })
  const brand = businessName || 'Brand'
  const cleanIndustry = industry || (isGame ? 'Mobile Gaming & Entertainment' : (isAppOrDigital ? 'Software & Apps' : 'E-Commerce'))
  const cleanNiche = niche || (isGame ? 'Action Mobile Game' : (isAppOrDigital ? 'Digital Product' : 'DTC Brand'))

  // Determine provider: Groq (default fast) or OpenAI
  const hasGroq = Boolean(groqApiKey && groqApiKey !== 'your_groq_api_key_here')
  const hasOpenAI = Boolean(openaiApiKey && openaiApiKey !== 'your_openai_api_key_here')

  if (!hasGroq && !hasOpenAI) {
    console.log('[AdPilot AI] Using high-converting built-in AI strategy generator.')
    return generateLocalFallbackCreatives({ businessName, industry, niche, productDesc, targetAudience, adGoal })
  }

  // Dynamic Prompt tailored specifically to Mobile Games, Apps, Global or Local eCommerce
  const prompt = `You are the Lead Creative Director and Media Buyer at AdPilot AI, an autonomous advertising agency.
Generate a high-converting digital advertising campaign plan for this business:

- Business Name: ${brand}
- Industry: ${cleanIndustry}
- Specific Niche: ${cleanNiche}
- Product Description: ${productDesc || 'Product/Service'}
- Target Audience: ${targetAudience || (isGlobal ? 'Global / Worldwide Audience' : 'Target Market')}
- Campaign Goal: ${adGoal || (isGame ? 'Mobile App Installs & Player Acquisition' : 'Conversions and ROAS')}
- Ad Channels: ${(channels || ['Meta', 'Instagram', 'Reels']).join(', ')}

${isGame ? `🚨 CRITICAL MOBILE GAME RULES:
- This is a MOBILE GAME with a ${isGlobal ? 'WORLDWIDE / GLOBAL' : 'targeted'} audience!
- DO NOT MENTION CASH ON DELIVERY OR PHYSICAL SHIPPING OR LOCAL COURIER!
- Headlines and Hooks MUST be about GAMEPLAY, challenges, rewards, free gems, levels, 5-star ratings, and mobile fun!
- Call to Actions MUST be: "Play Free Now", "Install Free", "Download on iOS & Android", "Claim Starter Pack"!
- AdSets MUST target Mobile Gamers, Global/Worldwide reach, iOS/Android users!` : ''}

${isAppOrDigital && !isGame ? `🚨 CRITICAL DIGITAL APP RULES:
- This is a digital app/software! DO NOT mention physical shipping or cash on delivery. Focus on app downloads, free trials, and smart features!` : ''}

${isGlobal && !isGame && !isAppOrDigital ? `🚨 CRITICAL GLOBAL AUDIENCE RULES:
- The audience is WORLDWIDE / GLOBAL! Do not restrict to Pakistani cities or local COD.` : ''}

Return ONLY valid JSON (no markdown formatting, no code blocks, no backticks, just raw JSON) matching this exact schema:
{
  "viralKeywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7", "keyword 8"],
  "trendingHashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"],
  "adCopies": [
    {
      "id": "copy_1",
      "angle": "${isGame ? 'Action Gameplay & Viral Challenge' : 'Direct Urgency / Limited Offer'}",
      "hook": "Attention-grabbing opening hook",
      "headline": "Punchy headline with offer",
      "primaryText": "Persuasive body copy",
      "callToAction": "${isGame ? 'Play Free Now' : (isAppOrDigital ? 'Install Free' : 'Shop Flash Sale')}",
      "badge": "${isGame ? '🔥 Top Rated Game' : 'High Conversion'}"
    },
    {
      "id": "copy_2",
      "angle": "${isGame ? 'Exclusive Starter Pack / In-Game Rewards' : (isGlobal ? 'Global Trust & Guarantee' : 'Cash on Delivery (COD) & Trust')}",
      "hook": "Trust and excitement hook",
      "headline": "Main value proposition headline",
      "primaryText": "Persuasive body text explaining key benefit",
      "callToAction": "${isGame ? 'Claim Free Gift' : (isAppOrDigital ? 'Try Free' : 'Order on COD')}",
      "badge": "Maximum Trust"
    },
    {
      "id": "copy_3",
      "angle": "Global Social Proof & Player Reviews",
      "hook": "Social proof hook",
      "headline": "Ratings & Community headline",
      "primaryText": "Social proof and excitement body copy",
      "callToAction": "${isGame ? 'Install & Play' : (isAppOrDigital ? 'Download Free' : 'See Reviews')}",
      "badge": "High ROAS"
    },
    {
      "id": "copy_4",
      "angle": "${isGame ? 'Anti-Boredom / Skill vs Clones Hook' : 'Problem-Agitation-Solution (PAS)'}",
      "hook": "Hook targeting pain point",
      "headline": "Headline highlighting contrast and solution",
      "primaryText": "Body copy explaining why this is better",
      "callToAction": "${isGame ? 'Download Now' : (isAppOrDigital ? 'Get Started' : 'Upgrade Today')}",
      "badge": "High CTR"
    },
    {
      "id": "copy_5",
      "angle": "${isGame ? 'Next-Gen Graphics & Immersive World' : 'VIP Experience & Premium Value'}",
      "hook": "Aspirational hook",
      "headline": "Next-gen / premium aesthetic headline",
      "primaryText": "Cinematic presentation body copy",
      "callToAction": "${isGame ? 'Play Free on iOS & Android' : (isAppOrDigital ? 'Explore Now' : 'Claim Offer')}",
      "badge": "Premium Quality"
    }
  ],
  "recommendedAdSets": [
    {
      "id": "adset_1",
      "name": "${isGame ? 'Tier 1 English Speaking (USA, UK, CA, AU) Mobile Gamers' : (isGlobal ? 'Tier 1 Global Buyers (USA, UK, CA, AU)' : 'Metro Cities High-Intent Buyers')}",
      "locations": "${isGlobal || isGame ? 'United States, United Kingdom, Canada, Australia' : 'Karachi, Lahore, Islamabad, Rawalpindi'}",
      "audience": "${isGame ? 'Age 16-35 | Mobile Gaming, Esports, Action/RPG Enthusiasts' : 'Age 22-45 | Online Shopping'}",
      "budgetSplit": 40,
      "selected": true,
      "placementType": "Feed & Story"
    },
    {
      "id": "adset_2",
      "name": "${isGame ? 'Worldwide Global Android High Volume Installs' : (isGlobal ? 'Worldwide Global E-Commerce Reach' : 'Nationwide COD Shoppers')}",
      "locations": "${isGlobal || isGame ? 'Worldwide Global' : 'All Pakistan (Tier 1 & Tier 2 Cities)'}",
      "audience": "${isGame ? 'Age 16-40 | Mobile App Installs, High Specs Device' : 'Age 18-50 | Discount Deals, Fast Shipping'}",
      "budgetSplit": 35,
      "selected": true,
      "placementType": "Reels 9:16 Video"
    },
    {
      "id": "adset_3",
      "name": "Social Engagement & Retargeting",
      "locations": "${isGlobal || isGame ? 'Worldwide Global' : 'Pakistan Nationwide'}",
      "audience": "Engaged with page, app, or website in last 30 days",
      "budgetSplit": 15,
      "selected": true,
      "placementType": "Retargeting Feed"
    },
    {
      "id": "adset_4",
      "name": "Advantage+ Broad Viral Discovery",
      "locations": "${isGlobal || isGame ? 'Worldwide Global' : 'Pakistan Nationwide'}",
      "audience": "Algorithmic Lookalike & High ROAS Broad Audience",
      "budgetSplit": 10,
      "selected": false,
      "placementType": "Broad AI Discovery"
    }
  ],
  "targetAudienceAngles": [
    "${isGame ? 'Mobile gamers on iOS and Android seeking competitive action' : 'High-intent online shoppers'}",
    "${isGame ? 'Casual and core players responsive to free starter pack rewards' : 'Value-driven customers'}"
  ],
  "recommendedBudget": 35000,
  "projectedRoas": "${isGame ? '4.5x - 5.2x' : '4.2x - 4.9x'}"
}`

  try {
    let response
    let engineUsed = ''

    if (hasGroq) {
      engineUsed = 'Groq LLM (llama-3.3-70b-versatile)'
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert viral ad copywriter and algorithmic media buyer. You respond ONLY with valid raw JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      })
    } else {
      engineUsed = 'OpenAI (gpt-4o-mini)'
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert viral ad copywriter and algorithmic media buyer. You respond ONLY with valid raw JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      })
    }

    if (!response.ok) {
      const errText = await response.text()
      console.warn(`[AdPilot AI] ${engineUsed} returned error (${response.status}):`, errText)
      return generateLocalFallbackCreatives({ businessName, industry, niche, productDesc, targetAudience, adGoal })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return generateLocalFallbackCreatives({ businessName, industry, niche, productDesc, targetAudience, adGoal })
    }

    // Clean JSON content if wrapped in markdown blocks
    const cleanJson = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    const parsed = JSON.parse(cleanJson)

    return {
      ...parsed,
      engineUsed
    }
  } catch (error) {
    console.error('[AdPilot AI] LLM Generation Exception:', error.message)
    return generateLocalFallbackCreatives({ businessName, industry, niche, productDesc, targetAudience, adGoal })
  }
}

/**
 * Rewrite a single ad copy angle on-demand using Groq LLM
 */
export async function rewriteAdCopyAngleWithLLM({
  businessName,
  niche,
  angle,
  currentHeadline,
  currentPrimaryText,
  style
}) {
  const groqApiKey = process.env.GROQ_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY
  const brand = businessName || 'AdPilot Brand'
  const cleanNiche = niche || 'Product'
  const { isGame, isAppOrDigital, isGlobal } = detectCampaignProfile({ businessName, niche, productDesc: currentHeadline })

  const prompt = `You are an elite direct-response ad copywriter.
Rewrite this specific ad copy hook for higher CTR and conversion:
- Brand: ${brand}
- Niche: ${cleanNiche}
- Angle: ${angle || 'High ROAS Hook'}
- Previous Headline: ${currentHeadline || 'Exclusive Offer'}
- Previous Text: ${currentPrimaryText || ''}
${isGame ? '- Product is a MOBILE GAME: Hook MUST be about gameplay, level challenge, free gems, or leaderboard excitement. CTA: "Play Free Now" or "Install Free". DO NOT MENTION CASH ON DELIVERY OR SHIPPING.' : ''}
${isAppOrDigital && !isGame ? '- Product is an APP/SOFTWARE: Hook must focus on smart features, speed, and free trial. DO NOT MENTION PHYSICAL SHIPPING OR COD.' : ''}

Return ONLY raw valid JSON (no markdown, no backticks):
{
  "angle": "${angle || 'Direct Urgency'}",
  "hook": "New viral opening sentence",
  "headline": "Punchy rewritten headline (max 80 chars)",
  "primaryText": "Persuasive body text (2-3 sentences)",
  "callToAction": "${isGame ? 'Play Free Now' : (isAppOrDigital ? 'Install Free' : 'Shop Now')}",
  "badge": "AI Optimized"
}`

  try {
    if (groqApiKey && groqApiKey !== 'your_groq_api_key_here') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert viral ad copywriter. Respond ONLY with valid raw JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.85,
          response_format: { type: 'json_object' }
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        if (content) {
          const cleanJson = content.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
          return JSON.parse(cleanJson)
        }
      }
    }
  } catch (err) {
    console.warn('[AdPilot AI] Groq rewrite error, using dynamic generator:', err.message)
  }

  // Dynamic variation fallback
  if (isGame) {
    return {
      angle: angle || 'Gameplay Challenge',
      hook: `🔥 Challenge: Can your reflexes handle the final boss battle in ${brand}?`,
      headline: `Download ${brand} Free | Claim 5,000 Free Gems (Limited Event)`,
      primaryText: `60FPS smooth combat, epic graphics, and zero pay-to-win mechanics. Join millions of players worldwide on iOS and Android today!`,
      callToAction: 'Play Free Now',
      badge: '🔥 Trending Game'
    }
  }

  if (isGlobal) {
    return {
      angle: angle || 'Global Express',
      hook: `🔥 Worldwide Trend: Over 50,000 satisfied customers across USA, UK, and worldwide!`,
      headline: `Get Genuine ${brand} | 30-Day Money Back Guarantee`,
      primaryText: `Direct express courier delivery worldwide with tracking. Trusted by thousands with premium quality assurance.`,
      callToAction: 'Shop Worldwide Now',
      badge: 'Global Express'
    }
  }

  return {
    angle: angle || 'Special Offer',
    hook: `🔥 Limited Time Drop: Experience the difference with genuine ${brand}.`,
    headline: `Flat 25% OFF ${brand} | 100% Satisfaction Guaranteed`,
    primaryText: `Engineered with precision materials for durability and performance. Backed by money-back guarantee with fast express dispatch.`,
    callToAction: 'Shop Now',
    badge: 'AI Rewritten Hook'
  }
}

/**
 * Real-time Conversational AI Chat with Groq LLM (OpenAI / GPT-OSS 120B)
 */
export async function chatWithLLM({ messages, businessContext }) {
  const groqApiKey = process.env.GROQ_API_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  const rawName = businessContext?.businessName && businessContext.businessName !== 'Not specified' ? businessContext.businessName : null
  const bNiche = businessContext?.niche && businessContext.niche !== 'Not specified' ? businessContext.niche : null
  const bProduct = businessContext?.productDesc && businessContext.productDesc !== 'Not specified' ? businessContext.productDesc : null

  // Analyze conversation and context to detect global / international / gaming profile
  const allUserText = (messages || []).map(m => m.text || m.content || '').join(' ').toLowerCase()
  const audText = (businessContext?.targetAudience || '').toLowerCase()
  const combinedAll = `${allUserText} ${audText} ${bProduct || ''} ${rawName || ''}`.toLowerCase()

  const isGlobal = combinedAll.includes('usa') || combinedAll.includes('uk') || 
                   combinedAll.includes('world') || combinedAll.includes('global') || 
                   combinedAll.includes('international') || combinedAll.includes('us ') || 
                   combinedAll.includes('america') || combinedAll.includes('britain')
  
  const isGame = combinedAll.includes('game') || combinedAll.includes('gaming') || 
                 combinedAll.includes('rpg') || combinedAll.includes('play store') || 
                 combinedAll.includes('app store')

  // Clean brand name: if it was default 'Karachi Threads' but user is targeting USA/UK/Global or Games, don't brand as Karachi
  const bName = (rawName === 'Karachi Threads' && (isGlobal || isGame)) ? 'Global Brand' : rawName

  const contextStr = businessContext
    ? `\nCurrent Business Knowledge:
- Business Name: ${bName || 'Not specified'}
- Niche/Category: ${bNiche || 'Not specified'}
- Hero Product: ${bProduct || 'Not specified'}
- Target Audience/Region: ${isGlobal ? 'USA, UK & International Tier-1' : (businessContext.targetAudience || 'Not specified')}
- Monthly Ad Budget: ${businessContext.customBudget ? `Rs. ${businessContext.customBudget} PKR` : 'Not specified'}`
    : ''

  const systemMessage = {
    role: 'system',
    content: isGlobal 
      ? `You are AdPilot AI, an elite Media Buyer and Autonomous Ad Strategist specialized in Global Meta Facebook & Instagram Ads (USA, UK, Europe, Tier-1 International, TikTok & Reels, Shopify / Direct to Consumer).
You speak in friendly, professional Roman Urdu and English.
🚨 STRICT MANDATORY RULE - GLOBAL AUDIENCE:
The user is targeting USA, UK, or International buyers. 
DO NOT mention Karachi, Lahore, Pakistan, or Cash on Delivery (COD)! 
NEVER suggest Pakistani cities or Pakistani courier companies. 
Focus strictly on international audience targeting, Tier-1 cities (New York, California, London, Manchester), high ROAS conversion ads, and express global delivery.`
      : `You are AdPilot AI, an elite Media Buyer and Autonomous Ad Strategist specialized in Meta Facebook/Instagram Ads.
You speak in friendly, professional Roman Urdu and English (conversational business tone).

${bName ? `🚨 STRICT MANDATORY RULE - DO NOT ASK FOR BUSINESS NAME:
The business name is ALREADY KNOWN as "${bName}" (${bNiche || 'eCommerce'}). The user has already provided this.
NEVER ask the user "Aapke business ka naam kya hai?", "What is your business name?", or ask for their business/brand name again!
Instead, address them by their brand name "${bName}" and directly discuss their product, target audience, budget, or strategy.` : `If business name is missing, ask for business name.`}

Guidelines:
- If the user provides info, acknowledge THEIR SPECIFIC brand/product warmly and guide them to the next question.
- If the user has provided product and audience details or says "generate strategy" / "strategy banao", tell them enthusiastically that you are generating their customized strategy report.
- Keep responses concise (2-3 sentences max) and actionable.${contextStr}`
  }

  try {
    if (groqApiKey && groqApiKey !== 'your_groq_api_key_here') {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            systemMessage,
            ...messages.map((m) => ({
              role: m.sender === 'user' || m.role === 'user' ? 'user' : 'assistant',
              content: m.text || m.content || ''
            }))
          ],
          temperature: 0.7,
          max_tokens: 350
        })
      })

      if (response.ok) {
        const data = await response.json()
        let reply = data.choices?.[0]?.message?.content
        if (reply) {
          reply = reply.trim()
          // Sanitize: If model accidentally asks for business name when business name is already known
          if (bName) {
            reply = reply
              .replace(/Aapke\s+business\s+ka\s+naam\s+(?:aur\s+category\s+)?kya\s+hai\??/gi, '')
              .replace(/What\s+is\s+your\s+business\s+name\??/gi, '')
              .replace(/Aapke\s+brand\s+ka\s+naam\s+kya\s+hai\??/gi, '')
              .trim()
            if (!reply) {
              reply = isGlobal 
                ? `Bohat khoob! USA aur UK target market ke liye hum international high-ROAS Meta Ads strategy finalize kar rahe hain.`
                : `Bohat khoob! '${bName}' ke liye hum high-ROAS Meta Ads strategy finalize kar rahe hain.`
            }
          }

          return {
            reply: reply,
            provider: 'Groq LLM (llama-3.3-70b-versatile)'
          }
        }
      }
    }
  } catch (err) {
    console.warn('[AdPilot AI] Groq chat error:', err.message)
  }

  // Fallback conversational reply
  if (isGlobal) {
    return {
      reply: `Bohat khoob! USA aur UK target market ke liye hum international high-ROAS Meta Ads strategy prepare kar rahe hain.`,
      provider: 'AdPilot Smart Response'
    }
  }

  if (isGame) {
    return {
      reply: `Bohat khoob! Mobile Game player acquisition aur app installs ke liye high-converting Meta Ads strategy prepare kar rahe hain.`,
      provider: 'AdPilot Smart Response'
    }
  }

  return {
    reply: (bName && bName !== 'Karachi Threads')
      ? `Bohat khoob! '${bName}' ke liye hum targeted Meta Ads strategy prepare kar rahe hain.`
      : "Bohat khoob! Main aapke business ke mutabiq high-ROAS Meta Ads strategy prepare kar raha hoon.",
    provider: 'AdPilot Smart Response'
  }
}


