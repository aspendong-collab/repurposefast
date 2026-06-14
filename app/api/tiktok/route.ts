/**
 * TikTok API — calls RapidAPI directly (workers.dev blocked in China)
 *
 * Architecture:   Vercel (saveik.com) → RapidAPI → TikTok
 * Download:       Browser → robotilab.online (direct, if available)
 *                 Fallback: /api/download → Vercel proxies the video
 */
import { NextResponse } from "next/server"

const TIKTOK_REGEX = /^(https?:\/\/)?(www\.|m\.|vm\.|vt\.)?(tiktok\.com|douyin\.com)\//

const RAPIDAPI_HOST = process.env.TIKTOK_API_HOST || "tiktok-video-downloader-api.p.rapidapi.com"
const RAPIDAPI_KEY = process.env.TIKTOK_API_KEY || ""

export async function POST(req: Request) {
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

  // Call RapidAPI directly (workers.dev blocked in China)
  try {
    const apiUrl = `https://${RAPIDAPI_HOST}/media?videoUrl=${encodeURIComponent(url)}`
    const apiResp = await fetch(apiUrl, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": RAPIDAPI_KEY,
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!apiResp.ok) {
      return NextResponse.json({ error: `RapidAPI returned ${apiResp.status}` }, { status: 502 })
    }

    const raw = (await apiResp.json()) as Record<string, unknown>
    if (raw.error) {
      return NextResponse.json({ error: raw.error as string }, { status: 502 })
    }

    const author = (raw.author as Record<string, string>) || {}
    const videoUrl = (raw.downloadUrl as string) || ""

    return NextResponse.json({
      type: "video",
      video: videoUrl,
      videoHd: videoUrl,
      videos: videoUrl ? [videoUrl] : null,
      images: null,
      music: null,
      description: raw.description || null,
      creator: author.username || author.nickname || null,
      duration: raw.duration || null,
      thumbnail: raw.cover || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "API call failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
