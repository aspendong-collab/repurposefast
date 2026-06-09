/**
 * TikTok API — Multi-provider fallback: Zell → Sanka → TikWM
 */
import { NextResponse } from "next/server"

// ============== Types ==============

interface TikTokAuthor {
  username?: string
  nickname?: string
  unique_id?: string
}

interface ZellResult {
  title?: string
  author?: TikTokAuthor
  thumbnail?: string
  video?: string
  music?: { url?: string; duration?: number }
  images?: unknown[]
}
interface ZellResponse { status: boolean; result?: ZellResult }

interface SankaResult {
  title?: string
  author?: TikTokAuthor
  cover?: string
  play?: string
  music?: string
  music_info?: { play?: string; duration?: number }
  images?: unknown[]
  duration?: number
}
interface SankaResponse { status: boolean; result?: SankaResult }

interface TikWMData {
  code: number; msg?: string
  data?: {
    title?: string
    author?: { nickname?: string; unique_id?: string }
    cover?: string; origin_cover?: string
    play?: string; hdplay?: string; wmplay?: string
    music?: string; duration?: number; images?: unknown[]
  }
}

interface TikTokData {
  title: string; creator: string; thumbnail: string
  videos: string[]; audio: string; slide: string[]; duration: string
}

// ============== Config ==============

const TIKTOK_REGEX = /^(https?:\/\/)?(www\.|m\.|vm\.|vt\.)?(tiktok\.com|douyin\.com)\//

// ============== Rate Limiting ==============

const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 60_000
  const maxRequests = 10
  const record = rateLimitCache.get(ip)
  if (!record || now > record.resetTime) {
    rateLimitCache.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }
  if (record.count >= maxRequests) return false
  record.count += 1
  return true
}

setInterval(() => {
  const now = Date.now()
  for (const [k, v] of rateLimitCache) { if (now > v.resetTime) rateLimitCache.delete(k) }
}, 60_000)

// ============== Provider: Zell ==============

async function fetchFromZell(url: string): Promise<TikTokData> {
  const apiUrl = `https://apizell.web.id/download/tiktok?url=${encodeURIComponent(url)}`
  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error(`Zell: HTTP ${res.status}`)
  const json = (await res.json()) as ZellResponse
  if (!json?.status || !json.result) throw new Error("Zell: invalid response")
  const r = json.result
  return {
    title: r.title || "",
    creator: r.author?.username || r.author?.nickname || "",
    thumbnail: r.thumbnail || "",
    videos: r.video ? [r.video] : [],
    audio: r.music?.url || "",
    slide: Array.isArray(r.images) ? r.images.filter((x): x is string => typeof x === "string") : [],
    duration: r.music?.duration ? String(r.music.duration) : "",
  }
}

// ============== Provider: Sanka ==============

async function fetchFromSanka(url: string): Promise<TikTokData> {
  const apiUrl = `https://www.sankavollerei.com/download/tiktok?apikey=planaai&url=${encodeURIComponent(url)}`
  const res = await fetch(apiUrl)
  if (!res.ok) throw new Error(`Sanka: HTTP ${res.status}`)
  const json = (await res.json()) as SankaResponse
  if (!json?.status || !json.result) throw new Error("Sanka: invalid response")
  const r = json.result
  return {
    title: r.title || "",
    creator: r.author?.unique_id || r.author?.nickname || "",
    thumbnail: r.cover || "",
    videos: r.play ? [r.play] : [],
    audio: (typeof r.music === "string" && r.music) ? r.music : r.music_info?.play || "",
    slide: Array.isArray(r.images) ? r.images.filter((x): x is string => typeof x === "string") : [],
    duration: (r.duration && r.duration > 0) ? String(r.duration) : r.music_info?.duration ? String(r.music_info.duration) : "",
  }
}

// ============== Provider: TikWM ==============

async function fetchFromTikWM(url: string): Promise<TikTokData> {
  const body = new URLSearchParams({ url, hd: "1" })
  const res = await fetch("https://tikwm.com/api/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/116 Mobile Safari/537.36",
      Cookie: "current_language=en",
    },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`TikWM: HTTP ${res.status}`)
  const json = (await res.json()) as TikWMData
  if (json.code !== 0 || !json.data) throw new Error(`TikWM: ${json.msg || "invalid response"}`)
  const d = json.data
  const videos: string[] = []
  if (d.hdplay) videos.push(d.hdplay)
  if (d.play && d.play !== d.hdplay) videos.push(d.play)
  if (videos.length === 0 && d.wmplay) videos.push(d.wmplay)
  return {
    title: d.title || "",
    creator: d.author?.unique_id || d.author?.nickname || "",
    thumbnail: d.origin_cover || d.cover || "",
    videos,
    audio: d.music || "",
    slide: Array.isArray(d.images) ? d.images.filter((x): x is string => typeof x === "string") : [],
    duration: d.duration ? String(d.duration) : "",
  }
}

// ============== Core: Multi-provider fallback ==============

async function fetchTikTok(url: string): Promise<TikTokData> {
  // 1) Zell
  try { return await fetchFromZell(url) } catch { /* fall through */ }
  // 2) Sanka
  try { return await fetchFromSanka(url) } catch { /* fall through */ }
  // 3) TikWM
  return fetchFromTikWM(url)
}

// ============== Route Handler ==============

export async function POST(req: Request) {
  // Origin check
  const origin = req.headers.get("origin") || ""
  const referer = req.headers.get("referer") || ""
  const allowed = ["saveik.com", "localhost", "127.0.0.1"]
  const isDev = process.env.NODE_ENV === "development" || origin.includes("localhost") || referer.includes("localhost")
  if ((origin || referer) && !isDev && !allowed.some(d => origin.includes(d) || referer.includes(d))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Rate limit
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, {
      status: 429,
      headers: { "Retry-After": "60", "X-RateLimit-Limit": "10", "X-RateLimit-Remaining": "0" },
    })
  }

  // Parse URL
  let url: string
  try {
    const body = (await req.json()) as { url?: unknown }
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "Please provide a TikTok URL" }, { status: 400 })
    }
    url = body.url.trim()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  if (!TIKTOK_REGEX.test(url)) {
    return NextResponse.json({ error: "Invalid TikTok URL" }, { status: 400 })
  }

  // Fetch
  try {
    const result = await fetchTikTok(url)
    if (!Array.isArray(result.videos)) result.videos = []
    const isPhoto = result.slide.length > 0 && result.videos.length === 0

    if (!isPhoto && result.videos.length === 0) {
      return NextResponse.json({ error: "No video found. Please check the URL." }, { status: 500 })
    }

    return NextResponse.json({
      type: isPhoto ? "image" : "video",
      video: result.videos[0] || null,
      videoHd: result.videos[0] || null,
      videos: result.videos.length > 0 ? result.videos : null,
      images: isPhoto ? result.slide : null,
      music: result.audio || null,
      description: result.title || null,
      creator: result.creator || null,
      duration: result.duration || null,
      thumbnail: result.thumbnail || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Download failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
