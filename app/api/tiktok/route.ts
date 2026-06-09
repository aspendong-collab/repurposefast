import { NextResponse } from "next/server"
import * as cheerio from "cheerio"

/**
 * TikTok Video Downloader — direct page scraping (ssstik.io approach)
 *
 * Fetches the TikTok video page, extracts the embedded JSON data,
 * and returns clean video/audio/thumbnail URLs.
 */

// ============== Types ==============

interface TikTokVideoData {
  type: "video" | "image"
  video: string | null
  videos: string[] | null
  images: string[] | null
  music: string | null
  description: string | null
  creator: string | null
  duration: string | null
  thumbnail: string | null
}

// ============== Config ==============

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"

const TIKTOK_REGEX =
  /^https?:\/\/(?:www\.|m\.|vm\.|vt\.)?(?:tiktok\.com|douyin\.com)\/(?:@[\w.-]+\/video\/\d+|\w+\/video\/\d+|v\/\d+|video\/\d+|[\w.-]+)[\w/?&=.-]*$/i

// ============== Scraper ==============

async function scrapeTikTokPage(url: string): Promise<TikTokVideoData> {
  // Step 1: Fetch the TikTok page
  const response = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
    },
    redirect: "follow",
  })

  if (!response.ok) {
    throw new Error(`TikTok returned ${response.status}`)
  }

  const html = await response.text()

  if (html.length < 5000) {
    throw new Error("TikTok returned an empty page")
  }

  // Step 2: Try __UNIVERSAL_DATA_FOR_REHYDRATION__ (desktop TikTok)
  {
    const match = html.match(
      /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i
    )
    if (match) {
      const result = extractFromUniversalData(match[1])
      if (result) return result
    }
  }

  // Step 3: Try SIGI_STATE (older TikTok page format)
  {
    const match = html.match(
      /<script[^>]*id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i
    )
    if (match) {
      const result = extractFromUniversalData(match[1])
      if (result) return result
    }
  }

  // Step 4: Try SEO meta tags (regex fallback)
  {
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i)
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i)
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
    const videoMatch =
      html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/i) ||
      html.match(/<meta\s+name="twitter:player:stream"\s+content="([^"]+)"/i)

    const title = titleMatch?.[1] || ""
    const description = descMatch?.[1] || ""
    const thumbnail = imageMatch?.[1] || ""
    const ogVideo = videoMatch?.[1] || ""

    if (title || thumbnail) {
      const creatorMatch = title.match(/^([^'s]+?)(?:'s)?\s*(?:on TikTok)?/)
      const creator = creatorMatch ? creatorMatch[1].trim().replace(/^@/, "") : ""

      return {
        type: "video",
        video: ogVideo || null,
        videos: ogVideo ? [ogVideo] : null,
        images: null,
        music: null,
        description: description || null,
        creator: creator || null,
        duration: null,
        thumbnail: thumbnail || null,
      }
    }
  }

  throw new Error("Could not extract video data from TikTok page")
}

function extractFromUniversalData(
  jsonText: string
): TikTokVideoData | null {
  try {
    const data = JSON.parse(jsonText)

    // Traverse to find video data
    const findVideo = (obj: unknown): Record<string, unknown> | null => {
      if (!obj || typeof obj !== "object") return null
      const o = obj as Record<string, unknown>

      // Found video container
      if (o["video"] && (typeof o["desc"] === "string" || o["author"])) {
        return o
      }

      // Search deeper
      for (const v of Object.values(o)) {
        const found = findVideo(v)
        if (found) return found
      }

      return null
    }

    const container = findVideo(data)
    if (!container) return null

    const video = container["video"] as Record<string, unknown> | undefined
    const author = container["author"] as Record<string, unknown> | undefined
    const music = container["music"] as Record<string, unknown> | undefined
    const imagePost = container["imagePost"] as Record<string, unknown> | undefined

    // Video URL — prefer the highest quality one
    let videoUrl = ""
    let videoHdUrl = ""

    if (video) {
      const downloadAddr = video["downloadAddr"] as string | undefined
      if (downloadAddr) videoUrl = downloadAddr

      // Check bitrateInfo for HD video
      const bitrateInfo = video["bitrateInfo"] as Array<Record<string, unknown>> | undefined
      if (bitrateInfo && bitrateInfo.length > 0) {
        const hd = bitrateInfo[bitrateInfo.length - 1]
        const playAddr = hd?.["PlayAddr"] as Record<string, unknown> | undefined
        const urlList = playAddr?.["UrlList"] as string[] | undefined
        if (urlList && urlList.length > 1) {
          videoHdUrl = urlList[1] || urlList[0]
          if (!videoUrl) videoUrl = urlList[0]
        } else if (urlList && urlList.length > 0) {
          if (!videoUrl) videoUrl = urlList[0]
        }
      }
    }

    // Thumbnail
    let thumbnail = ""
    const cover = video?.["originCover"] || video?.["cover"] || video?.["dynamicCover"]
    if (typeof cover === "string") {
      thumbnail = cover
    } else if (typeof cover === "object" && cover) {
      const ul = (cover as Record<string, unknown>)["urlList"] as string[] | undefined
      if (ul && ul.length > 0) thumbnail = ul[0]
    }

    // Description
    const desc = typeof container["desc"] === "string" ? container["desc"] : ""

    // Creator
    let creator = ""
    if (author) {
      creator =
        (typeof author["uniqueId"] === "string" ? author["uniqueId"] : "") ||
        (typeof author["nickname"] === "string" ? author["nickname"] : "")
    }

    // Duration (in seconds)
    let duration = ""
    if (video && typeof video["duration"] === "number" && video["duration"] > 0) {
      duration = String(video["duration"])
    }

    // Images (Photo Mode)
    const images: string[] = []
    if (imagePost) {
      const imgs = imagePost["images"] as Array<Record<string, unknown>> | undefined
      if (imgs) {
        for (const img of imgs) {
          const iu = img["imageURL"] as Record<string, unknown> | undefined
          const urlList = iu?.["urlList"] as string[] | undefined
          if (urlList && urlList.length > 0) images.push(urlList[0])
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

    const isPhoto = images.length > 0 && !videoUrl

    return {
      type: isPhoto ? "image" : "video",
      video: videoHdUrl || videoUrl || null,
      videos: videoUrl ? [videoUrl, ...(videoHdUrl ? [videoHdUrl] : [])] : null,
      images: images.length > 0 ? images : null,
      music: musicUrl || null,
      description: desc || null,
      creator: creator || null,
      duration: duration || null,
      thumbnail: thumbnail || null,
    }
  } catch {
    return null
  }
}

// ============== Route Handler ==============

export async function POST(req: Request) {
  // Parse body
  let url: string
  try {
    const body = (await req.json()) as { url?: unknown }
    if (!body.url || typeof body.url !== "string") {
      return NextResponse.json(
        { error: "Please provide a TikTok video link." },
        { status: 400 }
      )
    }
    url = body.url.trim()
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  // Validate URL
  if (!TIKTOK_REGEX.test(url)) {
    return NextResponse.json(
      { error: "Invalid TikTok URL. Please check the link and try again." },
      { status: 400 }
    )
  }

  // Scrape TikTok
  try {
    const result = await scrapeTikTokPage(url)
    return NextResponse.json(result)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Download failed. Please try again."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
