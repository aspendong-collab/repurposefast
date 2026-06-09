import { NextResponse } from "next/server"

/**
 * Media proxy — streams TikTok CDN media through our server so that
 * <video> / <img> tags can display cross-origin content without
 * CORS or Referer restrictions.
 *
 * Usage: /api/media?url=<encoded_url>
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const mediaUrl = searchParams.get("url")

  if (!mediaUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  // Basic validation — only allow known media CDNs
  const valid = /^https?:\/\/([a-z0-9.-]+\.)?(tiktokcdn\.com|tiktokcdn-us\.com|tiktokv\.com|byteoversea\.com|tiktok\.com|ibyteimg\.com)/i
  if (!valid.test(mediaUrl)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 })
  }

  try {
    const upstream = await fetch(mediaUrl, {
      headers: {
        "User-Agent": UA,
        Referer: "https://www.tiktok.com/",
      },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream ${upstream.status}` },
        { status: 502 }
      )
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream"
    const contentLength = upstream.headers.get("content-length")

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    }
    if (contentLength) headers["Content-Length"] = contentLength

    return new Response(upstream.body, { status: 200, headers })
  } catch {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 })
  }
}
