import { NextResponse } from "next/server"

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
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 }
      )
    }

    const contentType =
      res.headers.get("content-type") || "application/octet-stream"

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
      { error: "Download failed" },
      { status: 500 }
    )
  }
}
