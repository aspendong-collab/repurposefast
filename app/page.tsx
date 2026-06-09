"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import {
  ArrowDownToLine,
  Loader2,
  ShieldCheck,
  Zap,
  Monitor,
  Music,
  Smartphone,
  Globe,
  CheckCircle2,
  Copy,
  X,
  Sparkles,
  ChevronDown,
  Film,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { downloadWithProgress, generateFilename } from "@/modules/downloader/services/downloadClient"

// ============== Types ==============

interface TikTokApiResponse {
  type: "video" | "image"
  video?: string; videoHd?: string; videos?: string[]
  images?: string[]; music?: string
  description?: string; creator?: string
  duration?: string; thumbnail?: string; error?: string
}

interface TikTokResult {
  id: number; url: string; type: string; date: string
  videoUrl?: string; videoHdUrl?: string; videos?: string[]
  audioUrl?: string; imageUrls?: string[]
  description?: string; creator?: string
  duration?: string; thumbnail?: string
}

// ============== SEO Structured Data ==============

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "Is Saveik free to use?", acceptedAnswer: { "@type": "Answer", text: "Yes. Saveik is completely free with no registration or subscription. Unlimited downloads." } },
    { "@type": "Question", name: "Can I download TikTok videos without watermark?", acceptedAnswer: { "@type": "Answer", text: "Absolutely. Saveik removes the TikTok watermark automatically — clean video ready for any platform." } },
    { "@type": "Question", name: "What formats does Saveik support?", acceptedAnswer: { "@type": "Answer", text: "MP4 video (HD), MP3 audio, plus JPG/PNG images from TikTok Photo Mode." } },
    { "@type": "Question", name: "Do I need to install anything?", acceptedAnswer: { "@type": "Answer", text: "No. Works in your browser on iPhone, Android, Windows, Mac — no app needed." } },
    { "@type": "Question", name: "Can I download from private accounts?", acceptedAnswer: { "@type": "Answer", text: "No. Saveik respects privacy — only public TikTok videos are accessible." } },
    { "@type": "Question", name: "Where do files save?", acceptedAnswer: { "@type": "Answer", text: "Your device's default Downloads folder. On iPhone, use Save to Files." } },
  ],
}

// ============== API Helper ==============

async function fetchTikTokData(url: string): Promise<TikTokApiResponse> {
  const res = await fetch("/api/tiktok", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) })
  const data = (await res.json()) as TikTokApiResponse
  if (!res.ok || data.error) throw new Error(data.error ?? `Error: ${res.status}`)
  if (data.type === "video" && !data.video) throw new Error("No video found")
  return data
}

// ============== Floating Particles Generator ==============

function FloatingParticles() {
  return (
    <div className="particles-container">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${5 + Math.random() * 6}s`,
            width: `${2 + Math.random() * 4}px`,
            height: `${2 + Math.random() * 4}px`,
          }}
        />
      ))}
    </div>
  )
}

// ============== Animated Counter ==============

function AnimatedCounter({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const increment = end / (duration * 60)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) { setCount(end); clearInterval(timer) }
            else { setCount(Math.floor(start)) }
          }, 1000 / 60)
          return () => clearInterval(timer)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

// ============== Constants ==============

const features = [
  { icon: ShieldCheck, title: "No Watermark", desc: "Clean, watermark-free videos ready to repurpose anywhere.", color: "from-violet-500 to-purple-500" },
  { icon: Zap, title: "Unlimited & Free", desc: "No caps, no quotas — download as many videos as you want, forever.", color: "from-amber-500 to-orange-500" },
  { icon: Monitor, title: "Crystal HD Quality", desc: "Videos at the highest available resolution — crisp and clear every time.", color: "from-sky-500 to-cyan-500" },
  { icon: Music, title: "Video & Audio", desc: "Save as MP4 or extract high-quality MP3 audio from any TikTok.", color: "from-rose-500 to-pink-500" },
  { icon: Smartphone, title: "Every Device", desc: "iPhone, Android, PC, Mac — one tool that works everywhere seamlessly.", color: "from-emerald-500 to-teal-500" },
  { icon: Globe, title: "No Sign-Up", desc: "Paste and download. Privacy-first with zero data collected.", color: "from-indigo-500 to-blue-500" },
]

const steps = [
  { step: "01", title: "Copy Link", desc: "Open TikTok, tap Share, then Copy Link for any video you want." },
  { step: "02", title: "Paste & Process", desc: "Paste it above, hit Download — our engine handles the rest instantly." },
  { step: "03", title: "Save. Done.", desc: "Choose MP4 or MP3. The file saves directly to your device, watermark-free." },
]

const faqItems = [
  { q: "Is Saveik really free?", a: "100% free. No registration, no subscription, no fine print. Just paste a link and download." },
  { q: "How do I remove TikTok watermarks?", a: "Paste the link into Saveik. We automatically strip the watermark — you get a clean video every time." },
  { q: "Can I save TikTok audio as MP3?", a: "Yes. Every download gives you both MP4 video and MP3 audio options." },
  { q: "What devices are supported?", a: "Every device with a browser. iPhone, iPad, Android, Windows, Mac, Linux — it all works." },
  { q: "Can I download private videos?", a: "No. Saveik respects creator privacy — only publicly available TikTok videos are accessible." },
  { q: "What video quality do I get?", a: "The maximum available — up to 4K resolution, depending on the original upload." },
  { q: "Where do my downloaded files go?", a: "Your device's default Downloads folder. On iPhone/iPad, tap Save to Files." },
  { q: "Does Saveik store my data?", a: "Never. We don't store videos, audio, or any personal information. Downloads are direct." },
]

// ============== Main Component ==============

export default function SaveikDownloader() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentResult, setCurrentResult] = useState<TikTokResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95])
  const heroY = useTransform(scrollY, [0, 400], [0, -50])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    setIsLoading(true); setError(null)
    try {
      const data = await fetchTikTokData(url)
      setCurrentResult({
        id: Date.now(), url, type: data.type, date: new Date().toISOString(),
        videoUrl: data.type === "video" ? data.video : undefined,
        videoHdUrl: data.videoHd, videos: data.videos, audioUrl: data.music,
        imageUrls: data.type === "image" ? data.images : undefined,
        description: data.description, creator: data.creator, duration: data.duration, thumbnail: data.thumbnail,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong"
      setError(msg)
      toast({ variant: "destructive", title: "Download Failed", description: msg })
    } finally { setIsLoading(false) }
  }

  const handlePaste = async () => {
    try { if (navigator.clipboard?.readText) { const t = await navigator.clipboard.readText(); if (t) { setUrl(t.trim()); return } } } catch {}
    const m = window.prompt("Paste TikTok URL:"); if (m) setUrl(m.trim())
  }

  const handleClear = () => { setUrl(""); setCurrentResult(null); setError(null) }

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* ================================================================
            HERO — Dramatic, oversized, animated
            ================================================================ */}
        <section ref={heroRef} className="relative min-h-[92vh] flex items-center overflow-hidden bg-mesh">
          {/* Animated Orbs */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <FloatingParticles />

          <motion.div
            className="container relative mx-auto px-4 py-20 z-10"
            style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          >
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-violet-500/20 bg-violet-500/5 backdrop-blur-sm mb-10"
              >
                <Sparkles className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-violet-400">The fastest TikTok downloader on the web</span>
              </motion.div>

              {/* Main Heading — oversized */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 text-balance"
              >
                Download TikTok
                <br />
                <span className="gradient-premium-text">Without Limits</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-12 text-balance"
              >
                No watermarks. No sign-up. No caps. Just paste a TikTok link
                and get a pristine HD video in seconds.
              </motion.p>

              {/* Input Card — animated border */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl mx-auto"
              >
                <div className="animated-border-card p-0.5">
                  <Card className="border-0 shadow-2xl shadow-violet-500/10 bg-card/80 backdrop-blur-xl">
                    <CardContent className="p-3 sm:p-4">
                      <form onSubmit={handleSubmit}>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1 relative input-glow-premium rounded-lg">
                            <Input
                              type="text"
                              placeholder="Paste TikTok video link here..."
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              className="h-14 text-base pr-20 border-0 bg-muted/50 focus-visible:ring-0"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                              {url && (
                                <button type="button" onClick={handleClear}
                                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                              <button type="button" onClick={handlePaste}
                                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <Button type="submit" disabled={isLoading || !url}
                            className="h-14 px-8 font-semibold text-base gradient-premium text-white border-0 btn-shimmer">
                            {isLoading ? (
                              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                            ) : (
                              <><ArrowDownToLine className="mr-2 h-5 w-5" /> Download</>
                            )}
                          </Button>
                        </div>

                        <AnimatePresence>
                          {error && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-4 text-sm text-destructive bg-destructive/5 rounded-lg p-3 border border-destructive/10"
                            >
                              {error}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Trust indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex flex-wrap items-center justify-center gap-8 mt-10 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Privacy First
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  No Registration
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-sky-400" />
                  All Devices
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.button
            onClick={scrollToFeatures}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="text-xs font-medium tracking-widest uppercase">Discover</span>
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
              <ChevronDown className="h-5 w-5" />
            </motion.div>
          </motion.button>
        </section>

        {/* ===== LOADING STATE ===== */}
        <AnimatePresence>
          {isLoading && (
            <motion.section
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-24 flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500"
              />
              <p className="text-muted-foreground mt-8 text-lg">Processing your video...</p>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ===== RESULT ===== */}
        <AnimatePresence>
          {currentResult && !isLoading && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="container mx-auto px-4 py-8"
            >
              <Card className="max-w-xl mx-auto overflow-hidden border-border/40 bg-card/70 backdrop-blur-sm">
                <CardContent className="p-0">
                  {/* Thumbnail + Info Row */}
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="sm:w-48 flex-shrink-0 bg-muted/30 flex items-center justify-center min-h-48 relative overflow-hidden">
                      <Film className="h-10 w-10 text-muted-foreground/30 absolute" />
                      {currentResult.thumbnail && (
                        <img
                          src={`/api/img?url=${encodeURIComponent(currentResult.thumbnail)}`}
                          alt="Video thumbnail"
                          className="w-full h-48 sm:h-full object-cover relative z-10"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none"
                          }}
                        />
                      )}
                    </div>

                    {/* Info + Download */}
                    <div className="flex-1 min-w-0 p-4 sm:p-5 flex flex-col gap-3">
                      {/* Creator */}
                      {currentResult.creator && (
                        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400 truncate">
                          @{currentResult.creator}
                        </p>
                      )}

                      {/* Description */}
                      {currentResult.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {currentResult.description}
                        </p>
                      )}

                      {/* Meta badges */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Film className="h-3 w-3" />
                          {currentResult.type === "image" ? "Photo Mode" : "MP4"}
                        </Badge>
                        {currentResult.duration && (
                          <Badge variant="outline" className="text-xs">
                            {currentResult.duration}s
                          </Badge>
                        )}
                      </div>

                      {/* Download Buttons — always stacked, full width */}
                      <div className="flex flex-col gap-2 pt-1">
                        {currentResult.videoUrl && (
                          <Button
                            size="default"
                            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold"
                            onClick={() => downloadWithProgress(
                              currentResult.videoUrl!,
                              generateFilename("video", currentResult.creator)
                            )}
                          >
                            <Download className="h-4 w-4" />
                            Download MP4
                          </Button>
                        )}
                        {currentResult.audioUrl && (
                          <Button
                            size="default"
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => downloadWithProgress(
                              currentResult.audioUrl!,
                              generateFilename("audio", currentResult.creator)
                            )}
                          >
                            <Music className="h-4 w-4" />
                            Download MP3
                          </Button>
                        )}
                      </div>

                      {/* Photo mode: Download All */}
                      {currentResult.imageUrls && currentResult.imageUrls.length > 0 && (
                        <Button
                          size="lg"
                          className="gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold"
                          onClick={() => {
                            currentResult.imageUrls?.forEach((img, i) => {
                              setTimeout(() => {
                                downloadWithProgress(img, generateFilename("image", currentResult.creator, i))
                              }, i * 300)
                            })
                          }}
                        >
                          <Download className="h-5 w-5" />
                          Download {currentResult.imageUrls.length} Photos
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center mt-8">
                <Button variant="outline" onClick={handleClear} className="text-muted-foreground gap-2">
                  <X className="h-4 w-4" />
                  Download Another Video
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ================================================================
            FEATURES — scroll-triggered staggered reveal
            ================================================================ */}
        {!currentResult && (
          <section id="features" className="relative py-28 md:py-36 border-t border-border/30">
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center max-w-2xl mx-auto mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6">
                  Built Different
                </h2>
                <p className="text-lg text-muted-foreground text-balance">
                  Purpose-built for one thing — getting you the cleanest TikTok downloads, fast.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                {features.map(({ icon: Icon, title, desc, color }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="h-full border-border/30 bg-card/50 backdrop-blur-sm hover-lift glow-card overflow-hidden group">
                      <CardContent className="p-6 md:p-7">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg mb-2.5">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            HOW IT WORKS — numbered, bold, animated
            ================================================================ */}
        {!currentResult && (
          <section className="relative py-28 md:py-36 border-t border-border/30 bg-muted/20">
            <div className="container mx-auto px-4">
              <motion.div
                className="text-center max-w-2xl mx-auto mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6">
                  Three Steps.<br />
                  <span className="gradient-premium-text">That's It.</span>
                </h2>
                <p className="text-lg text-muted-foreground">
                  No complexity. No learning curve. Just paste and go.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
                {steps.map(({ step, title, desc }, i) => (
                  <motion.div
                    key={i}
                    className="text-center relative"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="text-8xl md:text-9xl font-black text-muted/10 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none">
                      {step}
                    </div>
                    <div className="relative z-10 pt-16">
                      <div className="w-16 h-16 rounded-2xl gradient-premium text-white flex items-center justify-center mx-auto mb-6 text-2xl font-black shadow-xl shadow-violet-500/25">
                        {i + 1}
                      </div>
                      <h3 className="font-bold text-xl mb-3">{title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            DEVICE GUIDES
            ================================================================ */}
        {!currentResult && (
          <section className="py-28 md:py-36 border-t border-border/30">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-center mb-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                Every Screen.<br />
                <span className="gradient-premium-text">Same Experience.</span>
              </motion.h2>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  {
                    icon: Smartphone,
                    title: "iPhone & Android",
                    subtitle: "Download on mobile",
                    steps: [
                      "Open TikTok app, find the video",
                      "Tap Share → Copy Link",
                      "Open browser, go to Saveik",
                      "Paste link, tap Download",
                      "Save to Photos or Files app",
                    ],
                  },
                  {
                    icon: Monitor,
                    title: "Windows, Mac & Linux",
                    subtitle: "Download on desktop",
                    steps: [
                      "Go to tiktok.com, find the video",
                      "Copy URL from address bar",
                      "Paste into Saveik above",
                      "Click Download, pick MP4 or MP3",
                      "File saves to Downloads folder",
                    ],
                  },
                ].map(({ icon: Icon, title, subtitle, steps: guideSteps }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="h-full border-border/30 bg-card/50 backdrop-blur-sm hover-lift">
                      <CardContent className="p-7 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl gradient-premium flex items-center justify-center shadow-lg shadow-violet-500/20">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{title}</h3>
                            <p className="text-sm text-muted-foreground">{subtitle}</p>
                          </div>
                        </div>
                        <ol className="space-y-3.5">
                          {guideSteps.map((s, j) => (
                            <li key={j} className="flex gap-3 text-sm text-muted-foreground">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/10 text-violet-500 flex items-center justify-center text-xs font-bold">
                                {j + 1}
                              </span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            STATS BANNER
            ================================================================ */}
        {!currentResult && (
          <section className="relative py-20 border-t border-border/30 overflow-hidden">
            <div className="absolute inset-0 bg-mesh opacity-50" />
            <div className="container relative mx-auto px-4 z-10">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-6 px-8 py-6 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30">
                  <div className="text-center px-4">
                    <div className="text-3xl md:text-4xl font-black gradient-premium-text">
                      <AnimatedCounter end={100} duration={3} />%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Free Forever</div>
                  </div>
                  <div className="w-px h-10 bg-border/50" />
                  <div className="text-center px-4">
                    <div className="text-3xl md:text-4xl font-black gradient-premium-text">
                      <AnimatedCounter end={12800} duration={3} />+
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Downloads Today</div>
                  </div>
                  <div className="w-px h-10 bg-border/50 hidden sm:block" />
                  <div className="text-center px-4 hidden sm:block">
                    <div className="text-3xl md:text-4xl font-black gradient-premium-text">
                      <AnimatedCounter end={98} duration={3} />+
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Languages</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ================================================================
            FAQ
            ================================================================ */}
        {!currentResult && (
          <section className="py-28 md:py-36 border-t border-border/30 bg-muted/20">
            <div className="container mx-auto px-4 max-w-3xl">
              <motion.h2
                className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-center mb-16"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                You Ask.<br />
                <span className="gradient-premium-text">We Answer.</span>
              </motion.h2>

              <div className="space-y-3">
                {faqItems.map(({ q, a }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Card className="border-border/30 bg-card/50 backdrop-blur-sm hover-lift">
                      <CardContent className="p-5 md:p-6">
                        <h3 className="font-semibold mb-2">{q}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================================
            CTA
            ================================================================ */}
        {!currentResult && (
          <section className="py-24 md:py-32 border-t border-border/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh" />
            <div className="container relative mx-auto px-4 text-center z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6">
                  Ready to Download?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto text-balance">
                  Paste any TikTok link and get a clean, HD video in seconds.
                  No catch.
                </p>
                <Button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="h-14 px-10 text-base font-bold gradient-premium text-white btn-shimmer"
                >
                  <ArrowDownToLine className="mr-2 h-5 w-5" />
                  Start Downloading Now
                </Button>
              </motion.div>
            </div>
          </section>
        )}
      </main>

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border/30 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg gradient-premium flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <ArrowDownToLine className="h-4.5 w-4.5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">
                  Save<span className="gradient-premium-text">ik</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The fastest, cleanest TikTok downloader on the web.
                No watermarks. No limits. No nonsense.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 text-sm">
              <div>
                <h3 className="font-semibold mb-3">Legal</h3>
                <ul className="space-y-2.5 text-muted-foreground">
                  <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
                  <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a></li>
                  <li><a href="/faq" className="hover:text-foreground transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Support</h3>
                <ul className="space-y-2.5 text-muted-foreground">
                  <li><a href="/help-center" className="hover:text-foreground transition-colors">Help Center</a></li>
                  <li><a href="/feedback" className="hover:text-foreground transition-colors">Feedback</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border/30 mt-12 pt-8 text-center">
            <p className="text-xs text-muted-foreground mb-2">
              Saveik is independent. Not affiliated with TikTok, Douyin, or ByteDance.
            </p>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Saveik. For personal use.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
