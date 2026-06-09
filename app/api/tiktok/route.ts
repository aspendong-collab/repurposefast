import { NextResponse } from "next/server"

// ============== Config ==============

// Cloudflare Worker proxy URL — deployed on Cloudflare Workers (Singapore edge)
// Change this if you redeploy the Worker with a different name
const PROXY_URL = "https://tiktok-proxy.aspendong.workers.dev/proxy"

const PROVIDERS = {
  zell: "https://apizell.web.id/download/tiktok",
  sanka: "https://www.sankavollerei.com/download/tiktok",
  tikwm: "https://tikwm.com/api/",
}

// ============== Types ==============

interface TikTokData {
  title: string
  creator: string
  thumbnail: string
  videos: string[]
  audio: string
  slide: string[]
  duration: string
}

interface ProviderResponse {
  status?: boolean
  code?: number
  msg?: string
  data?: Record<string, unknown>
  result?: Record<string, unknown>
  error?: string
}

// ============== Proxy helper ==============

async function proxyFetch(
  provider: keyof typeof PROVIDERS,
  tiktokUrl: string,
  method: "GET" | "POST" = "POST",
  queryParams?: Record<string, string>
): Promise<ProviderResponse> {
  let fullUrl = PROVIDERS[provider]
  let postBody: string | undefined

  if (method === "GET" && queryParams) {
    const qs = new URLSearchParams(queryParams).toString()
    fullUrl = `${fullUrl}?${qs}`
  } else if (method === "POST") {
    const params = new URLSearchParams()
    params.set("url", tiktokUrl)
    if (provider === "tikwm") params.set("hd", "1")
    postBody = params.toString()
  }

  const res = await fetch(PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider,
      url: fullUrl,
      method,
      body: postBody,
    }),
  })

  const text = await res.text().catch(() => "")

  if (!res.ok) {
    throw new Error(`${provider}: Proxy ${res.status} — ${text.substring(0, 300)}`)
  }

  try {
    return JSON.parse(text) as ProviderResponse
  } catch {
    throw new Error(`${provider}: non-JSON — ${text.substring(0, 200)}`)
  }
}

// ============== Provider Parsers (unchanged from original) ==============

// ===== Zell =====

function parseZell(data: ProviderResponse): TikTokData {
  if (!data.status) throw new Error(data.msg || "Zell: download failed")

  const r = (data.data || data.result || {}) as Record<string, unknown>

  const title = typeof r.title === "string" ? r.title : ""
  const author = r.author as Record<string, string> | undefined
  const creator =
    author?.unique_id || author?.nickname || author?.username || ""
  const thumbnail = typeof r.thumbnail === "string" ? r.thumbnail : ""
  const video = typeof r.video === "string" ? r.video : ""
  const music = (r.music as Record<string, unknown>)?.url as string | undefined

  const images = Array.isArray(r.images)
    ? r.images.filter((item): item is string => typeof item === "string")
    : []

  const duration =
    typeof r.duration === "number" && r.duration > 0
      ? String(r.duration)
      : ""

  return {
    title,
    creator,
    thumbnail,
    videos: video ? [video] : [],
    audio: music || "",
    slide: images,
    duration,
  }
}

// ===== Sanka =====

interface SankaResult {
  title?: string
  author?: {
    unique_id?: string
    nickname?: string
    username?: string
  }
  cover?: string
  play?: string
  music?: string
  music_info?: { play?: string; duration?: number }
  images?: string[]
  duration?: number
}

function parseSanka(data: ProviderResponse): TikTokData {
  const result = (data.data || data.result || {}) as SankaResult

  const title = typeof result.title === "string" ? result.title : ""
  const author = result.author
  const creator =
    author?.unique_id || author?.nickname || author?.username || ""
  const thumbnail = typeof result.cover === "string" ? result.cover : ""
  const video = typeof result.play === "string" ? result.play : ""
  const music =
    typeof result.music === "string" && result.music
      ? result.music
      : typeof result.music_info?.play === "string"
        ? result.music_info.play
        : ""

  const images = Array.isArray(result.images)
    ? result.images.filter((item): item is string => typeof item === "string")
    : []

  const duration =
    typeof result.duration === "number" && result.duration > 0
      ? String(result.duration)
      : typeof result.music_info?.duration === "number"
        ? String(result.music_info.duration)
        : ""

  return {
    title,
    creator,
    thumbnail,
    videos: video ? [video] : [],
    audio: music,
    slide: images,
    duration,
  }
}

// ===== TikWM =====

function parseTikWM(data: ProviderResponse): TikTokData {
  if (data.code !== 0) throw new Error(data.msg || "TikWM: download failed")

  const r = (data.data || data.result || {}) as Record<string, unknown>

  const title = typeof r.title === "string" ? r.title : ""
  const author = r.author as Record<string, string> | undefined
  const creator =
    author?.unique_id || author?.nickname || author?.username || ""
  const thumbnail = typeof r.cover === "string" ? r.cover : ""
  const video = typeof r.play === "string" ? r.play : ""

  const music =
    typeof r.music === "string" && r.music
      ? r.music
      : typeof (r.music_info as Record<string, unknown>)?.play === "string"
        ? ((r.music_info as Record<string, unknown>).play as string)
        : ""

  const images = Array.isArray(r.images)
    ? r.images.filter((item): item is string => typeof item === "string")
    : []

  const duration =
    typeof r.duration === "number" && r.duration > 0
      ? String(r.duration)
      : typeof (r.music_info as Record<string, unknown>)?.duration === "number"
        ? String((r.music_info as Record<string, unknown>).duration)
        : ""

  return {
    title,
    creator,
    thumbnail,
    videos: video ? [video] : [],
    audio: music,
    slide: images,
    duration,
  }
}

// ============== TikTok URL validation ==============

const tiktokRegex =
  /^https?:\/\/(?:www\.|vm\.|m\.)?(?:tiktok\.com|douyin\.com)\/(?:@[\w.-]+\/video\/\d+|\w+\/video\/\d+|v\/\d+|video\/\d+)[\w/?&=.-]*$/i

// ============== Rate Limiting ==============

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
    return true
  }
  if (entry.count >= 10) return false
  entry.count++
  return true
}

// ============== Core fetch (with provider fallback) ==============

type ProviderName = keyof typeof PROVIDERS

async function fetchTikTok(url: string): Promise<TikTokData> {
  if (!tiktokRegex.test(url)) throw new Error("Invalid TikTok URL. Please check the link and try again.")

  const chain: Array<{ name: ProviderName; parser: (d: ProviderResponse) => TikTokData; method: "GET" | "POST"; queryParams?: Record<string, string> }> = [
    { name: "zell", parser: parseZell, method: "POST" },
    { name: "sanka", parser: parseSanka, method: "GET", queryParams: { apikey: "planaai" } },
    { name: "tikwm", parser: parseTikWM, method: "POST" },
  ]

  const errors: string[] = []

  for (const { name, parser, method, queryParams } of chain) {
    try {
      const data = await proxyFetch(name, url, method, queryParams)
      return parser(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error"
      errors.push(`${name}: ${msg}`)
    }
  }

  throw new Error(
    `All providers failed: ${errors.join(" | ")}`
  )
}

// ============== Route Handler ==============

export async function POST(req: Request) {
  // Origin check
  const origin = req.headers.get("origin") || ""
  const referer = req.headers.get("referer") || ""
  const isLocalhost = origin.includes("localhost") || referer.includes("localhost")
  const allowedDomains = [
    "saveik.com",
    "www.saveik.com",
    "saveiks.vercel.app",
    "localhost",
    "127.0.0.1",
  ]
  const isAllowed = allowedDomains.some((d) => origin.includes(d) || referer.includes(d))

  if ((origin || referer) && !isLocalhost && !isAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  // Parse body
  let url: string
  try {
    const body = (await req.json()) as { url?: unknown }
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "Please provide a TikTok video link." }, { status: 400 })
    }
    url = body.url
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  // Fetch
  try {
    const result = await fetchTikTok(url)

    const images = result.slide
    const isPhoto = images.length > 0 && result.videos.length === 0
    const audioUrl = result.audio || undefined

    return NextResponse.json({
      type: isPhoto ? "image" : "video",
      video: result.videos[0] || null,
      videos: result.videos.length > 0 ? result.videos : null,
      images: images.length > 0 ? images : null,
      music: audioUrl || null,
      description: result.title || null,
      creator: result.creator || null,
      duration: result.duration || null,
      thumbnail: result.thumbnail || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Download failed. Please try again later."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
