import { NextResponse } from "next/server"

/**
 * Image proxy — fetches TikTok CDN images with TikTok Referer
 * to bypass hotlinking protection.
 *
 * Usage: /api/img?url=<encoded_url>
 */

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const imgUrl = searchParams.get("url")

  if (!imgUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  // Only allow TikTok CDN domains
  const valid = /^https?:\/\/([a-z0-9.-]+\.)?(tiktokcdn\.com|tiktokcdn-us\.com|tiktok\.com|ibyteimg\.com|byteoversea\.com|tiktokv\.com)/i
  if (!valid.test(imgUrl)) {
    return NextResponse.json({ error: "Invalid source" }, { status: 400 })
  }

  try {
    const upstream = await fetch(imgUrl, {
      headers: {
        "User-Agent": UA,
        Referer: "https://www.tiktok.com/",
      },
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 })
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    const cacheControl = "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800"

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "CDN-Cache-Control": cacheControl,
      },
    })
  } catch {
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 })
  }
}
