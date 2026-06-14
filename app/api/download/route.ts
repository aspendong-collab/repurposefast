import { NextResponse } from "next/server"

/**
 * Download proxy — Vercel fetches from robotilab.online / direct CDN URLs.
 * Workers.dev is blocked in China, so we proxy downloads directly.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const videoUrl = searchParams.get("url")
  const filename = searchParams.get("name") || "saveik_video.mp4"

  if (!videoUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  try {
    const res = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      )
    }

    const contentType =
      res.headers.get("content-type") || "video/mp4"

    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Download proxy failed" },
      { status: 500 }
    )
  }
}
