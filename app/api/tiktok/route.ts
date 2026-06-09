import { NextResponse } from "next/server"

/**
 * TikTok Video Downloader API
 *
 * Strategy: fetch the TikTok video page directly and extract the
 * embedded JSON data. No third-party providers — just like ssstik.io.
 */

// ============== Config ==============

const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

const UA_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

// ============== Helpers ==============

function extractJsonFromHtml(html: string): Record<string, unknown> | null {
  // Try __UNIVERSAL_DATA_FOR_REHYDRATION__ (desktop TikTok)
  const rehydrateMatch = html.match(
    /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>\s*(\{.*?\})\s*<\/script>/s
  )
  if (rehydrateMatch) {
    try { return JSON.parse(rehydrateMatch[1]) } catch {}
  }

  // Try SIGI_STATE (older pages)
  const sigiMatch = html.match(
    /<script[^>]*id="SIGI_STATE"[^>]*>\s*(\{.*?\})\s*<\/script>/s
  )
  if (sigiMatch) {
    try { return JSON.parse(sigiMatch[1]) } catch {}
  }

  return null
}

function extractVideoData(json: Record<string, unknown>): {
  videoUrl: string
  thumbnail: string
  description: string
  creator: string
  duration: number
  images: string[]
  musicUrl: string
} | null {
  try {
    // __UNIVERSAL_DATA_FOR_REHYDRATION__ path
    const defaultScope = json["__DEFAULT_SCOPE__"] as Record<string, unknown> | undefined
    if (defaultScope) {
      const videoDetail = (defaultScope["webapp.video-detail"] || defaultScope["seo.abtest"]) as Record<string, unknown> | undefined
      if (videoDetail) {
        const itemInfo = videoDetail["itemInfo"] as Record<string, unknown> | undefined
        const itemStruct = (itemInfo?.["itemStruct"] || videoDetail["itemInfo"]) as Record<string, unknown> | undefined

        if (itemStruct) {
          return extractFromItemStruct(itemStruct)
        }
      }
    }

    // Fallback: traverse deeply
    return deepExtract(json)
  } catch {
    return null
  }
}

function extractFromItemStruct(item: Record<string, unknown>): {
  videoUrl: string
  thumbnail: string
  description: string
  creator: string
  duration: number
  images: string[]
  musicUrl: string
} {
  const video = item["video"] as Record<string, unknown> | undefined
  const author = item["author"] as Record<string, unknown> | undefined
  const music = item["music"] as Record<string, unknown> | undefined
  const imagePost = item["imagePost"] as Record<string, unknown> | undefined

  // Video URL — prefer downloadAddr (no watermark)
  let videoUrl = ""
  if (video) {
    const downloadAddr = video["downloadAddr"] || video["playAddr"]
    if (typeof downloadAddr === "string") videoUrl = downloadAddr
    // Also check bitrateInfo for HD
    const bitrateInfo = video["bitrateInfo"] as Array<Record<string, unknown>> | undefined
    if (bitrateInfo && bitrateInfo.length > 0) {
      const hd = bitrateInfo[bitrateInfo.length - 1]
      const playAddr = hd?.["PlayAddr"] as Record<string, unknown> | undefined
      const urlList = playAddr?.["UrlList"] as string[] | undefined
      if (urlList && urlList.length > 0) videoUrl = urlList[0]
    }
  }

  // Thumbnail
  let thumbnail = ""
  const cover = video?.["cover"] || video?.["originCover"] || video?.["dynamicCover"]
  if (typeof cover === "string") {
    thumbnail = cover
  } else if (typeof cover === "object" && cover) {
    const urlList = (cover as Record<string, unknown>)["urlList"] as string[] | undefined
    if (urlList && urlList.length > 0) thumbnail = urlList[0]
  }

  // Description
  const desc = typeof item["desc"] === "string" ? item["desc"] : ""

  // Creator
  let creator = ""
  if (author) {
    creator = (typeof author["uniqueId"] === "string" ? author["uniqueId"] : "") ||
      (typeof author["nickname"] === "string" ? author["nickname"] : "")
  }

  // Duration
  let duration = 0
  if (video && typeof video["duration"] === "number") duration = video["duration"]

  // Images (photo mode)
  const images: string[] = []
  if (imagePost) {
    const imgs = imagePost["images"] as Array<Record<string, unknown>> | undefined
    if (imgs) {
      for (const img of imgs) {
        const urlList = img["imageURL"]?.["urlList"] || img["urlList"]
        if (Array.isArray(urlList) && urlList.length > 0) {
          images.push(urlList[0] as string)
        }
      }
    }
  }

  // Music URL
  let musicUrl = ""
  if (music) {
    const playUrl = music["playUrl"] as Record<string, unknown> | undefined
    const urlList = playUrl?.["urlList"] || playUrl?.["UrlList"]
    if (Array.isArray(urlList) && urlList.length > 0) {
      musicUrl = urlList[0] as string
    }
  }

  return { videoUrl, thumbnail, description, creator, duration, images, musicUrl }
}

function deepExtract(json: Record<string, unknown>): {
  videoUrl: string
  thumbnail: string
  description: string
  creator: string
  duration: number
  images: string[]
  musicUrl: string
} | null {
  // Recursively search for video data
  const queue = [json]
  while (queue.length > 0) {
    const obj = queue.shift()!
    for (const [key, val] of Object.entries(obj)) {
      if (key === "video" && typeof val === "object" && val && "downloadAddr" in val) {
        // Found video container, try to extract
        const parent = obj as Record<string, unknown>
        if (parent["author"] || parent["desc"] || parent["music"]) {
          return extractFromItemStruct(parent)
        }
      }
      if (typeof val === "object" && val && !Array.isArray(val)) {
        queue.push(val as Record<string, unknown>)
      }
    }
    if (queue.length > 100) break // safety limit
  }
  return null
}

// ============== API fetcher ==============

async function fetchTikTokPage(videoUrl: string): Promise<string> {
  // Try desktop UA first (more reliable for data extraction)
  const res = await fetch(videoUrl, {
    headers: {
      "User-Agent": UA_DESKTOP,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  })

  if (!res.ok) {
    throw new Error(`TikTok returned ${res.status}`)
  }

  const html = await res.text()
  if (html.length < 1000) {
    throw new Error("TikTok returned empty or too-short page")
  }

  return html
}

// ============== Route Handler ==============

export async function POST(req: Request) {
  // Parse URL
  let url: string
  try {
    const body = (await req.json()) as { url?: unknown }
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "Please provide a TikTok video link." }, { status: 400 })
    }
    url = body.url.trim()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  // Validate URL
  const tiktokRegex = /https?:\/\/(?:www\.|m\.|vm\.|vt\.)?(?:tiktok\.com|douyin\.com)\/\S+/i
  if (!tiktokRegex.test(url)) {
    return NextResponse.json({ error: "Invalid TikTok URL. Please check the link and try again." }, { status: 400 })
  }

  try {
    // Step 1: Fetch TikTok page
    const html = await fetchTikTokPage(url)

    // Step 2: Extract JSON data
    const json = extractJsonFromHtml(html)
    if (!json) {
      // Fallback to third-party providers if page scraping fails
      return await fallbackProviders(url)
    }

    // Step 3: Extract video data
    const data = extractVideoData(json)
    if (!data) {
      return await fallbackProviders(url)
    }

    // Step 4: Return response
    const isPhoto = data.images.length > 0 && !data.videoUrl

    return NextResponse.json({
      type: isPhoto ? "image" : "video",
      video: data.videoUrl || null,
      videos: data.videoUrl ? [data.videoUrl] : null,
      images: data.images.length > 0 ? data.images : null,
      music: data.musicUrl || null,
      description: data.description || null,
      creator: data.creator || null,
      duration: data.duration > 0 ? String(data.duration) : null,
      thumbnail: data.thumbnail || null,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Download failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ============== Fallback: third-party providers ==============

async function fallbackProviders(tiktokUrl: string) {
  // Try TikWM as last resort
  try {
    const params = new URLSearchParams()
    params.set("url", tiktokUrl)
    params.set("hd", "1")

    const res = await fetch("https://tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": UA_DESKTOP,
      },
      body: params.toString(),
    })

    const data = await res.json() as Record<string, unknown>
    if (data["code"] === 0) {
      const d = (data["data"] || {}) as Record<string, unknown>
      const images = Array.isArray(d["images"]) ? d["images"] as string[] : []
      return NextResponse.json({
        type: images.length > 0 ? "image" : "video",
        video: (d["play"] || d["hdplay"] || null) as string | null,
        videos: d["play"] ? [d["play"]] as string[] : null,
        images: images.length > 0 ? images : null,
        music: (d["music"] || null) as string | null,
        description: (d["title"] || null) as string | null,
        creator: ((d["author"] as Record<string, string>)?.unique_id || null) as string | null,
        duration: d["duration"] ? String(d["duration"]) : null,
        thumbnail: (d["cover"] || null) as string | null,
      })
    }
  } catch {
    // ignore
  }

  return NextResponse.json(
    { error: "Unable to download. TikTok may have changed its page structure. Please try again later." },
    { status: 500 }
  )
}