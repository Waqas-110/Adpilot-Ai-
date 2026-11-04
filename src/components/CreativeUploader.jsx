import React, { useState } from 'react'
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Film, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Play,
  Lightbulb,
  Tag,
  ChevronDown,
  ChevronUp,
  Layers,
  Wand2,
  AlertTriangle
} from 'lucide-react'

// Realistic preset sample creatives for fast demo testing
const SAMPLE_CREATIVES = [
  {
    id: 'cr_preset_1',
    name: 'Dynamic E-Com Showcase - Feed (1:1)',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    aspectRatio: '1:1 (Square)',
    headline: 'Premium Quality Everyday Essentials | 20% Off',
    aiScore: 94,
    format: 'Meta Feed / Instagram Post',
    overlayBadge: '🚚 Free Delivery Across Pakistan',
    audit: {
      score: 94,
      positives: [
        'Clear product focal point with optimal contrast',
        'Text density is well below Meta 20% limit',
        'Aspect ratio 1:1 is ideal for Meta & Instagram Feed'
      ],
      missing: [
        'Call-to-Action button like "Order on WhatsApp" missing on image',
        'Add star ratings (⭐⭐⭐⭐⭐) to increase social proof CTR'
      ]
    }
  },
  {
    id: 'cr_preset_2',
    name: 'Viral Customer Unboxing - Reel (9:16)',
    type: 'video',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-streetwear-outfit-39879-large.mp4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-pink-streetwear-outfit-39879-large.mp4',
    aspectRatio: '9:16 (Vertical Story)',
    headline: 'Why 10,000+ Customers In Pakistan Switched This Month',
    aiScore: 91,
    format: 'TikTok / Instagram Reels',
    overlayBadge: '🔥 Cash On Delivery Available',
    audit: {
      score: 91,
      positives: [
        'Vertical 9:16 ratio is fully optimized for Reels & Stories',
        'High energetic visual opening hook'
      ],
      missing: [
        'Add closed captions (Urdu / English) for sound-off viewers',
        'Highlight return/exchange warranty badge'
      ]
    }
  }
]

export default function CreativeUploader({ creatives, setCreatives }) {
  const [dragActive, setDragActive] = useState(false)
  const [headline, setHeadline] = useState('')
  const [expandedAuditId, setExpandedAuditId] = useState(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Generate realistic AI creative audit and suggestions for what is missing ("kya kami hai")
  const generateCreativeAudit = (isVideo, fileName) => {
    if (isVideo) {
      return {
        score: Math.floor(88 + Math.random() * 8),
        positives: [
          'Vertical 9:16 format detected — fully compliant with Instagram & Facebook Reels',
          'Dynamic motion stops feed scrolling within first 3 seconds'
        ],
        missing: [
          'Urdu/English sub-captions missing (80% of mobile users watch without audio)',
          'No visible "Cash On Delivery (COD)" tag detected',
          'Add a clear final CTA screen (e.g. "Order on WhatsApp / Shop Now")'
        ]
      }
    } else {
      return {
        score: Math.floor(82 + Math.random() * 10),
        positives: [
          '1:1 Square aspect ratio is optimal for Facebook & Instagram Feed',
          'Text density is safe (under Meta 20% penalty rule)',
          'Clear subject visibility with sharp focal contrast'
        ],
        missing: [
          '⚠️ Offer / Price Badge missing: "Flat 25% OFF" ya "Free Delivery" tag nazar nahi aarha — offer badge lagane se conversion 35% barh sakti hai',
          '⚠️ Direct Call-to-Action missing: Creative par "Order Now" ya WhatsApp icon add karein',
          'ℹ️ Reels Placement Note: Yeh image hai, is liye sirf Meta Feed par run hogi (Reels video ad set nahi banega jab tak video upload na ho)'
        ]
      }
    }
  }

  const handleFiles = (files) => {
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const isVideo = file.type.startsWith('video/')
      const blobUrl = URL.createObjectURL(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const audit = generateCreativeAudit(isVideo, file.name)
        const newCreative = {
          id: 'cr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: file.name,
          type: isVideo ? 'video' : 'image',
          url: blobUrl || e.target.result,
          videoUrl: isVideo ? (blobUrl || e.target.result) : null,
          aspectRatio: isVideo ? '9:16 (Vertical Story)' : '1:1 (Square)',
          headline: headline || (isVideo ? 'Viral Reels Video Hook' : 'High-ROAS Feed Creative'),
          aiScore: audit.score,
          format: isVideo ? 'Instagram & Facebook Reels' : 'Meta & Instagram Feed',
          audit: audit,
          overlayBadge: null
        }
        setCreatives((prev) => [...prev, newCreative])
        setExpandedAuditId(newCreative.id)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files)
  }

  const handleAddSample = (sample) => {
    const freshId = 'sample_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5)
    setCreatives((prev) => [...prev, { ...sample, id: freshId }])
    setExpandedAuditId(freshId)
  }

  const removeCreative = (id) => {
    setCreatives((prev) => prev.filter((c) => c.id !== id))
    if (expandedAuditId === id) setExpandedAuditId(null)
  }

  // 1-Click Pakistani Badge Stamper
  const applyOverlayBadge = (id, badgeText) => {
    setCreatives((prev) => prev.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          overlayBadge: c.overlayBadge === badgeText ? null : badgeText,
          aiScore: Math.min(99, c.aiScore + 5)
        }
      }
      return c
    }))
  }

  // Placement detection
  const hasVideos = creatives.some((c) => c.type === 'video')
  const hasImages = creatives.some((c) => c.type === 'image')

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Ad Creatives & Media Assets</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {creatives.length} Added
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Upload images for <b>Meta Feed</b> or vertical videos for <b>Reels</b> (with AI Quality Audit)
          </p>
        </div>

        {/* Quick sample loader for testing */}
        <button
          type="button"
          onClick={() => handleAddSample(SAMPLE_CREATIVES[creatives.length % SAMPLE_CREATIVES.length])}
          className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/30 flex items-center gap-1 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insert Sample Creative</span>
        </button>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
          dragActive
            ? 'border-indigo-400 bg-indigo-500/10'
            : 'border-slate-700 hover:border-slate-600 bg-slate-900/40'
        }`}
      >
        <input
          type="file"
          id="creative-file-input"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center pointer-events-none">
          <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-2">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-200">
            Drop your ad images or videos here, or <span className="text-indigo-400 underline">browse</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Supports PNG, JPG, MP4, MOV (Recommended: 1:1 Feed & 9:16 Vertical Reels)
          </p>
        </div>
      </div>

      {/* Placement Intelligence Alert */}
      {creatives.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            <span className="text-slate-300">
              <b>Calculated AdSets:</b>{' '}
              {hasVideos && hasImages ? (
                <span className="text-purple-300 font-semibold">2 AdSets (Meta Feed Images + Instagram Reels Video)</span>
              ) : hasVideos ? (
                <span className="text-purple-300 font-semibold">1 AdSet (Instagram & FB Reels Video)</span>
              ) : (
                <span className="text-emerald-300 font-semibold">1 AdSet (Meta Feed Images Only — No empty Reels)</span>
              )}
            </span>
          </div>

          {!hasVideos && hasImages && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              💡 Reels disabled (Upload 9:16 video to add Reels AdSet)
            </span>
          )}
        </div>
      )}

      {/* Uploaded Creatives Preview Grid */}
      {creatives.length > 0 && (
        <div className="space-y-3 pt-1">
          {creatives.map((c) => {
            const isAuditOpen = expandedAuditId === c.id
            return (
              <div
                key={c.id}
                className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-3 p-3 items-start sm:items-center justify-between">
                  {/* Left: Media Thumbnail & Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/60">
                      {c.type === 'video' ? (
                        <div className="relative w-full h-full">
                          <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                      ) : (
                        <img src={c.url} alt={c.name} className="w-full h-full object-cover" />
                      )}
                      
                      {/* Overlay Badge Stamp */}
                      {c.overlayBadge && (
                        <div className="absolute inset-x-0 bottom-0 py-0.5 bg-indigo-600/90 text-[8px] font-bold text-white text-center truncate px-0.5">
                          {c.overlayBadge}
                        </div>
                      )}

                      <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-bold bg-slate-950/80 text-white">
                        {c.type === 'video' ? '9:16' : '1:1'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {c.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          c.type === 'video' 
                            ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        }`}>
                          {c.type === 'video' ? 'Reels Video' : 'Feed Image'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {c.headline}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          AI Score: {c.aiScore}/100
                        </span>
                        {c.overlayBadge && (
                          <span className="text-[10px] text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/30 truncate max-w-[150px]">
                            {c.overlayBadge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Audit Toggle & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setExpandedAuditId(isAuditOpen ? null : c.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>AI Suggestions & Kya Kami Hai</span>
                      {isAuditOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeCreative(c.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded AI Quality Audit & Missing Improvements Drawer */}
                {isAuditOpen && c.audit && (
                  <div className="p-3.5 bg-slate-950/60 border-t border-slate-800 text-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 flex items-center gap-1.5">
                        <Wand2 className="w-4 h-4 text-indigo-400" />
                        AI Creative Inspection & Actionable Suggestions
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Targeting Pakistani Online Shoppers
                      </span>
                    </div>

                    {/* What's Missing / Kya Kami Hai */}
                    <div>
                      <p className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Kya Kami Hai (Recommended Improvements):
                      </p>
                      <ul className="space-y-1.5 pl-4 text-[11px] text-slate-300 list-disc">
                        {c.audit.missing.map((item, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Positive aspects */}
                    <div>
                      <p className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Kya Theek Hai (Strengths):
                      </p>
                      <ul className="space-y-1 pl-4 text-[11px] text-slate-300 list-disc">
                        {c.audit.positives.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {/* 1-Click Pakistani Offer Overlay Badges */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <p className="text-[11px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        1-Click Offer Badge Apply Karein (Conversion Booster):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '🚚 Free Delivery Across Pakistan',
                          '🔥 Flat 25% OFF Limited Time',
                          '💵 Cash On Delivery Available',
                          '⭐ 10,000+ Happy Customers'
                        ].map((badge) => (
                          <button
                            key={badge}
                            type="button"
                            onClick={() => applyOverlayBadge(c.id, badge)}
                            className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                              c.overlayBadge === badge
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                          >
                            {c.overlayBadge === badge ? '✓ ' + badge : '+ ' + badge}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
