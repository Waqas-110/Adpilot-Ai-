import React, { useState, useRef, useEffect } from 'react'
import { 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Heart, 
  Bookmark, 
  Send, 
  MoreHorizontal, 
  Globe, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Video,
  Edit3,
  Check,
  Layers,
  Sparkle
} from 'lucide-react'

// Default fallback sample videos & images for realistic Pakistani eCommerce preview
const DEFAULT_REELS_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-streetwear-outfit-39879-large.mp4'
const DEFAULT_FEED_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'

export default function AdMockupPreview({
  businessName = 'My Business',
  businessLogo = null,
  adCopy = null,
  adCopies = [],
  creative = null,
  website = 'https://mybrand.com',
  ctaType = null
}) {
  const [previewPlatform, setPreviewPlatform] = useState('reels') // 'reels' | 'facebook' | 'instagram'
  const [selectedAngleIdx, setSelectedAngleIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [isEditingHeadline, setIsEditingHeadline] = useState(false)
  const [customHeadline, setCustomHeadline] = useState('')
  const [customPrimaryText, setCustomPrimaryText] = useState('')
  const videoRef = useRef(null)

  // Determine active ad copy from props or angle selector
  const activeCopy = (adCopies && adCopies.length > selectedAngleIdx) 
    ? adCopies[selectedAngleIdx] 
    : (adCopy || {
        angle: 'Feature Highlight',
        headline: '🔥 Experience Next-Gen Quality Today',
        primaryText: 'Upgrade your experience with genuine performance and top-rated features. Available now.',
        hook: 'Join thousands of satisfied users worldwide!'
      })

  // Synchronize headline and primary text
  const currentHeadline = customHeadline || activeCopy?.headline || creative?.headline || 'Experience Next-Gen Quality Today'
  const currentPrimaryText = customPrimaryText || activeCopy?.primaryText || activeCopy?.hook || 'Top-rated quality engineered for real performance. Available now with 100% satisfaction guarantee.'
  const currentScriptHook = creative?.scriptHook || activeCopy?.hook || 'Pehle 3 seconds: "Check out this incredible feature today!"'
  const currentBadge = creative?.badge || creative?.overlayBadge || activeCopy?.badge || 'Top Rated'

  // Profile detection for clean dynamic CTA & labels (No forced COD on games / worldwide apps)
  const combinedContext = `${businessName || ''} ${currentHeadline || ''} ${currentPrimaryText || ''} ${activeCopy?.callToAction || ''} ${ctaType || ''}`.toLowerCase()
  const isGameOrApp = combinedContext.includes('game') || combinedContext.includes('gaming') || combinedContext.includes('gamer') || 
                      combinedContext.includes('app') || combinedContext.includes('play') || combinedContext.includes('install') || 
                      combinedContext.includes('download') || combinedContext.includes('rpg')
  const isGlobalContext = combinedContext.includes('world') || combinedContext.includes('global') || combinedContext.includes('international') || combinedContext.includes('usa')

  // Dynamic clean CTA type
  const resolvedCta = ctaType || activeCopy?.callToAction || (isGameOrApp ? 'Play Free Now' : (isGlobalContext ? 'Shop Global Sale' : 'Order on Cash on Delivery'))

  // Determine active media URL (Video or Image)
  const isVideoCreative = creative?.type === 'video' || Boolean(creative?.videoUrl) || previewPlatform === 'reels'
  const videoSource = creative?.videoUrl || (creative?.type === 'video' && creative?.url?.startsWith('blob:') ? creative.url : null) || DEFAULT_REELS_VIDEO
  const imageSource = creative?.url || DEFAULT_FEED_IMAGE

  // Play/pause video toggle
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  // Toggle audio
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  // Auto-play when switching to reels
  useEffect(() => {
    if (previewPlatform === 'reels' && videoRef.current) {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }, [previewPlatform, videoSource])

  return (
    <div className="rounded-2xl glass-panel border border-slate-700/80 overflow-hidden shadow-2xl bg-slate-900/90 text-slate-100">
      
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP HEADER & CONTROLS */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              Live Meta Ad Preview & Placement Simulator
            </span>
          </div>

          {/* Platform Switcher: Reels 9:16 vs FB Feed vs IG Feed */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setPreviewPlatform('reels')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                previewPlatform === 'reels'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Reels (9:16 Video)</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewPlatform('facebook')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                previewPlatform === 'facebook'
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Facebook Feed
            </button>
            <button
              type="button"
              onClick={() => setPreviewPlatform('instagram')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                previewPlatform === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Instagram Feed
            </button>
          </div>
        </div>

        {/* 2. AD COPY ANGLE SWITCHER (If multiple angles exist) */}
        {adCopies && adCopies.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mr-1">
              <Layers className="w-3 h-3 text-indigo-400" />
              <span>Select Heading Angle:</span>
            </span>
            {adCopies.map((copy, idx) => (
              <button
                key={copy.id || idx}
                type="button"
                onClick={() => {
                  setSelectedAngleIdx(idx)
                  setCustomHeadline(copy.headline)
                  setCustomPrimaryText(copy.primaryText)
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  selectedAngleIdx === idx
                    ? 'bg-indigo-600 text-white shadow-sm border border-indigo-400/40 font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                }`}
              >
                Angle {idx + 1}: {copy.angle || `Option ${idx + 1}`}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsEditingHeadline(!isEditingHeadline)}
              className="ml-auto px-2 py-1 rounded text-[11px] font-medium text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingHeadline ? 'Hide Edit' : 'Edit Headline Directly'}</span>
            </button>
          </div>
        )}

        {/* 3. DIRECT HEADLINE & PRIMARY TEXT INLINE EDITOR */}
        {isEditingHeadline && (
          <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2.5 text-xs animate-in fade-in">
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">
                Aapki Ad Ki Main Heading (Headline) — Preview par foran update hogi:
              </label>
              <input
                type="text"
                value={customHeadline || currentHeadline}
                onChange={(e) => setCustomHeadline(e.target.value)}
                placeholder="Enter headline..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-indigo-500/60 text-white font-bold outline-none text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 font-bold block mb-1">
                Ad Primary Text (Description & Hook):
              </label>
              <textarea
                rows={2}
                value={customPrimaryText || currentPrimaryText}
                onChange={(e) => setCustomPrimaryText(e.target.value)}
                placeholder="Enter primary ad copy text..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 outline-none text-xs resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. AD MOCKUP PREVIEW FRAME */}
      {/* ------------------------------------------------------------------ */}
      <div className="p-4 sm:p-6 flex justify-center bg-[#070b14]/70">
        
        {/* ================================================================ */}
        {/* VIEW 1: REELS 9:16 VERTICAL VIDEO MOCKUP */}
        {/* ================================================================ */}
        {previewPlatform === 'reels' ? (
          <div className="relative w-full max-w-[290px] sm:max-w-[320px] aspect-[9/16] rounded-3xl bg-black border-4 border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between text-white font-sans select-none group">
            
            {/* Real HTML5 Video Player */}
            <div className="absolute inset-0 z-0 bg-black cursor-pointer" onClick={togglePlay}>
              <video
                ref={videoRef}
                src={videoSource}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover filter brightness-[0.95]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* Reels Top Bar */}
            <div className="relative z-10 p-3 flex items-center justify-between text-xs text-white drop-shadow">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide">Reels</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 backdrop-blur-sm uppercase font-semibold">
                  Sponsored
                </span>
              </div>
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
              </button>
            </div>

            {/* Center Play/Pause Indicator on Click / Hover */}
            <div 
              onClick={togglePlay}
              className={`relative z-10 self-center transition-all cursor-pointer ${
                isPlaying ? 'opacity-0 group-hover:opacity-80' : 'opacity-100 scale-110'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-2xl">
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white fill-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                )}
              </div>
            </div>

            {/* Right Action Rail (Reels Likes, Comments, Share, Audio Disc) */}
            <div className="absolute right-2.5 bottom-28 z-10 flex flex-col items-center gap-3.5 text-white drop-shadow">
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </div>
                <span className="text-[10px] font-bold">14.8K</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">492</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                  <Send className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">1.2K</span>
              </div>
              <div className="p-2 rounded-full bg-black/40 backdrop-blur-sm">
                <MoreHorizontal className="w-5 h-5" />
              </div>
              {/* Spinning Disc */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 border-2 border-white animate-spin flex items-center justify-center">
                <Music className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Bottom Content, Headline & Full-width CTA */}
            <div className="relative z-10 p-3 space-y-2 pointer-events-auto">
              
              {/* Profile & Sponsor Info */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/40 flex items-center justify-center font-bold text-xs text-white">
                  {businessName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white drop-shadow">{businessName}</span>
                    <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/30" />
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/20 backdrop-blur-sm text-white">
                      Follow
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-300">Sponsored • Meta Reels</span>
                </div>
              </div>

              {/* High-visibility Headline Box (Aapki Di Gayi Heading) */}
              <div className="p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/25 shadow-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 uppercase font-mono">
                    {activeCopy?.angle || 'High ROAS Angle'}
                  </span>
                  {currentBadge && (
                    <span className="text-[9px] text-emerald-300 font-semibold truncate max-w-[140px]">
                      ✓ {currentBadge}
                    </span>
                  )}
                </div>

                <p className="font-extrabold text-white text-xs leading-snug drop-shadow">
                  {currentHeadline}
                </p>

                <p className="text-[10px] text-slate-300 line-clamp-2 leading-tight">
                  {currentPrimaryText}
                </p>
              </div>

              {/* Call to Action Button Bar */}
              <button
                type="button"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{resolvedCta}</span>
                <span className="text-[10px] font-normal text-indigo-200">
                  {isGameOrApp ? '| Free on iOS & Android' : (isGlobalContext ? '| Worldwide Fast Delivery' : '| Cash on Delivery (Pakistan)')}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* ================================================================ */
          /* VIEW 2: FEED ADS (FACEBOOK & INSTAGRAM) */
          /* ================================================================ */
          <div className="w-full max-w-sm rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden font-sans">
            
            {/* Ad Header (Brand Logo + Business Name + Sponsored) */}
            <div className="p-3 flex items-center justify-between border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                {/* Brand Logo Avatar */}
                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md border border-slate-700">
                  {businessLogo ? (
                    <img src={businessLogo} alt={businessName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{businessName?.charAt(0)?.toUpperCase() || 'A'}</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                      {businessName || 'Your Business Name'}
                    </span>
                    <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400/20" />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span>Sponsored</span>
                    <span>•</span>
                    <Globe className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

              <div className="text-slate-400 hover:text-white cursor-pointer p-1">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            </div>

            {/* Ad Primary Copy / Description */}
            <div className="px-3 pt-2.5 pb-2 text-xs text-slate-200 leading-relaxed font-normal space-y-1">
              <p className="font-bold text-white text-xs">{currentHeadline}</p>
              <p className="text-[11px] text-slate-300">{currentPrimaryText}</p>
            </div>

            {/* Ad Creative Media (Video or Image) */}
            <div className="relative aspect-square w-full bg-slate-950 overflow-hidden">
              {isVideoCreative && videoSource ? (
                <video
                  src={videoSource}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src={imageSource} 
                  alt="Ad Creative Media" 
                  className="w-full h-full object-cover"
                />
              )}

              {/* Offer Stamp Badge */}
              {currentBadge && (
                <div className="absolute bottom-2.5 left-2.5 right-2.5 py-1.5 px-3 rounded-lg bg-indigo-600/95 text-white font-bold text-xs text-center shadow-lg backdrop-blur-sm border border-indigo-400/30 truncate">
                  {currentBadge}
                </div>
              )}
            </div>

            {/* Call-to-Action Bar (Facebook style vs Instagram style) */}
            {previewPlatform === 'facebook' ? (
              <div className="p-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold truncate">
                    {website.replace(/^https?:\/\//, '') || 'adpilot.pk'}
                  </p>
                  <p className="text-xs font-bold text-white truncate">
                    {currentHeadline}
                  </p>
                </div>

                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-600/80 shadow-sm flex items-center gap-1 flex-shrink-0"
                >
                  <span>{resolvedCta}</span>
                </button>
              </div>
            ) : (
              <div className="p-2.5 bg-gradient-to-r from-purple-900/40 to-slate-900 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">
                  {resolvedCta} &gt;
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                  {currentHeadline}
                </span>
              </div>
            )}

            {/* Social Proof Bar */}
            <div className="px-3 py-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="flex -space-x-1">
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">👍</span>
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[9px]">❤️</span>
                </span>
                <span className="font-medium text-slate-300">1,420</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>184 comments</span>
                <span>96 shares</span>
              </div>
            </div>

            {/* Action Buttons (Like / Comment / Share) */}
            <div className="px-2 py-1.5 border-t border-slate-800/80 flex items-center justify-around text-slate-400 text-xs font-semibold">
              <button className="flex items-center gap-1.5 hover:text-white py-1">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Like</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-white py-1">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Comment</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-white py-1">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
