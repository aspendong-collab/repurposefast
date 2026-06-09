import { NextResponse } from "next/server"

// ============== Types ==============

interface TikTokResult {
  type: "video" | "image"
  video?: string
  videos?: string[]
  images?: string[]
  music?: string
  description?: string
  creator?: string
  duration?: string
  thumbnail?: string
}

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

// ============== TikTok URL validation ==============

const tiktokRegex = /^https?:\/\/(?:www\.|vm\.|m\.)?(?:tiktok\.com|douyin\.com)\/(?:@[\w.-]+\/video\/\d+|\w+\/video\/\d+|v\/\d+|video\/\d+)[\w/?&=.-]*$/i

function extractTikTokUrl(input: string): string | null {
  const tiktokUrlRegex = /https?:\/\/(?:www\.|vm\.|m\.)?(?:tiktok\.com|douyin\.com)\/\S+/i
  const match = input.match(tiktokUrlRegex)
  if (!match) return null
  try {
    const url = new URL(match[0])
    return url.origin + url.pathname
  } catch {
    return null
  }
}

// ============== Core Downloader ==============

interface TikTokDLResponse {
  status: string
  message?: string
  result?: {
    type?: string
    video?: string[]
    video2?: string[]
    images?: string[]
    music?: string[]
    description?: string
    author?: string
    duration?: string
    cover?: string
    nickname?: string
  }
}

async function fetchTikTok(url: string): Promise<TikTokResult> {
  const cleanUrl = extractTikTokUrl(url)
  if (!cleanUrl) throw new Error("Invalid TikTok URL")

  // Try @tobyg74/tiktok-api-dl (primary provider)
  try {
    const { Downloader } = await import("@tobyg74/tiktok-api-dl")

    // The package uses musicallydown, ssstik, and snaptik as sources
    const result = await Downloader(cleanUrl, {
      version: "v1",
    }) as TikTokDLResponse

    if (result.status === "error" || !result.result) {
      throw new Error(result.message || "Provider returned error")
    }

    const r = result.result
    const video = r.video?.[0] || r.video2?.[0] || ""
    const videos = [...(r.video || []), ...(r.video2 || [])]
    const images = r.images || []
    const music = r.music?.[0] || ""
    const isPhoto = images.length > 0 && !video

    return {
      type: isPhoto ? "image" : "video",
      video: video || undefined,
      videos: videos.length > 0 ? videos : undefined,
      images: images.length > 0 ? images : undefined,
      music: music || undefined,
      description: r.description || r.nickname || "",
      creator: r.author || r.nickname || "",
      duration: r.duration || "",
      thumbnail: r.cover || "",
    }
  } catch (err) {
    // If the package fails, throw with detail
    const message = err instanceof Error ? err.message : "Download failed"
    throw new Error(message)
  }
}

// ============== Route Handler ==============

export async function POST(req: Request) {
  // 1. Origin check
  const origin = req.headers.get("origin") || ""
  const referer = req.headers.get("referer") || ""
  const isLocalhost = origin.includes("localhost") || referer.includes("localhost")

  const allowedDomains = ["saveik.com", "saveiks.vercel.app", "localhost", "127.0.0.1"]

  const isAllowed = allowedDomains.some(
    (d) => origin.includes(d) || referer.includes(d)
  )

  if ((origin || referer) && !isLocalhost && !isAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // 2. Rate limiting
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  // 3. Parse body
  let url: string
  try {
    const body = (await req.json()) as { url?: unknown }
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "Missing TikTok URL" }, { status: 400 })
    }
    url = body.url
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  // 4. Fetch
  try {
    const result = await fetchTikTok(url)

    return NextResponse.json({
      type: result.type,
      video: result.video || null,
      videos: result.videos || null,
      images: result.images || null,
      music: result.music || null,
      description: result.description || null,
      creator: result.creator || null,
      duration: result.duration || null,
      thumbnail: result.thumbnail || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Download failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
