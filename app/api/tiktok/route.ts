/**
 * TikTok API — delegates to Cloudflare Worker
 *
 * Vercel IPs are blocked by TikTok → scraping runs on CF edge instead.
 * CF Worker URL: https://api.saveik.com (set up CNAME in Cloudflare DNS)
 */
import { NextResponse } from "next/server"

const TIKTOK_REGEX = /^(https?:\/\/)?(www\.|m\.|vm\.|vt\.)?(tiktok\.com|douyin\.com)\//

// Cloudflare Worker URL
const WORKER_URL = process.env.TIKTOK_WORKER_URL || "https://api.saveik.com"

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

  // Forward to Cloudflare Worker
  try {
    const workerRes = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })

    const data = (await workerRes.json()) as Record<string, unknown>

    if (!workerRes.ok || data.error) {
      return NextResponse.json(
        { error: data.error || "Download failed" },
        { status: workerRes.status || 500 }
      )
    }

    // Transform worker response → frontend-expected format
    return NextResponse.json({
      type: data.type || "video",
      video: data.video || null,
      videoHd: data.video || null,
      videos: data.video ? [data.video] : null,
      images: data.images || null,
      music: data.music || null,
      description: data.description || null,
      creator: data.creator || null,
      duration: data.duration || null,
      thumbnail: data.thumbnail || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Worker connection failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
