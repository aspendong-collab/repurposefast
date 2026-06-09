/**
 * Cloudflare Worker — TikTok Scraper
 *
 * Runs on Cloudflare's global edge network.
 * CF IPs are residential-grade → TikTok won't block them.
 *
 * Deploy: `npx wrangler deploy`
 * Then point api.saveik.com CNAME → worker subdomain
 */

// Mobile User-Agent — looks like a real phone browser
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"

const TIKTOK_REGEX = /^https?:\/\/(?:www\.|m\.|vm\.|vt\.)?(tiktok\.com|douyin\.com)\//

// ====================== CORS ======================

const ALLOWED_ORIGINS = [
  "https://saveik.com",
  "https://www.saveik.com",
  "http://localhost:3000",
]

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  }
}

// ====================== Scraper ======================

async function scrapeTikTok(url) {
  // Fetch the TikTok page
  const resp = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  })

  if (!resp.ok) throw new Error(`TikTok returned ${resp.status}`)

  const html = await resp.text()
  if (html.length < 5000) throw new Error("TikTok returned an empty/captcha page")

  // Try __UNIVERSAL_DATA_FOR_REHYDRATION__
  const universalMatch = html.match(
    /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i
  )
  if (universalMatch) {
    const result = extractFromJSON(universalMatch[1])
    if (result) return result
  }

  // Try SIGI_STATE
  const sigiMatch = html.match(
    /<script[^>]*id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i
  )
  if (sigiMatch) {
    const result = extractFromJSON(sigiMatch[1])
    if (result) return result
  }

  // Fallback: SEO meta tags
  const ogTitle = (html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || [])[1] || ""
  const ogImage = (html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) || [])[1] || ""
  const ogVideo = (html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/i) || [])[1] || ""

  if (ogTitle || ogImage) {
    const creatorMatch = ogTitle.match(/^([^'s]+)/)
    return {
      type: "video",
      description: (html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) || [])[1] || null,
      creator: creatorMatch ? creatorMatch[1].trim().replace(/^@/, "") : null,
      duration: null,
      thumbnail: ogImage || null,
      video: ogVideo || null,
      music: null,
      images: null,
    }
  }

  throw new Error("Could not extract video data from TikTok page")
}

function extractFromJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText)

    // Deep search for video container
    const findContainer = (obj, depth) => {
      if (!obj || typeof obj !== "object" || depth > 10) return null
      if (obj.video && (typeof obj.desc === "string" || obj.author)) return obj
      for (const v of Object.values(obj)) {
        const found = findContainer(v, depth + 1)
        if (found) return found
      }
      return null
    }

    const container = findContainer(data, 0)
    if (!container) return null

    const video = container.video || {}
    const author = container.author || {}
    const music = container.music || {}
    const imagePost = container.imagePost

    // --- Video URL ---
    let videoUrl = ""
    const downloadAddr = video.downloadAddr || ""
    if (downloadAddr) videoUrl = downloadAddr
    const bitrateInfo = video.bitrateInfo
    if (Array.isArray(bitrateInfo) && bitrateInfo.length > 0) {
      const hd = bitrateInfo[bitrateInfo.length - 1]
      const pa = (hd && hd.PlayAddr) || {}
      const urlList = pa.UrlList
      if (Array.isArray(urlList) && urlList.length > 0) {
        videoUrl = urlList[urlList.length - 1] || urlList[0]
      }
    }

    // --- Thumbnail ---
    let thumbnail = ""
    const cover = video.originCover || video.cover || video.dynamicCover
    if (typeof cover === "string") {
      thumbnail = cover
    } else if (cover && typeof cover === "object") {
      const ul = cover.urlList || cover.UrlList
      if (Array.isArray(ul) && ul.length > 0) thumbnail = ul[0]
    }

    // --- Description ---
    const desc = typeof container.desc === "string" ? container.desc : ""

    // --- Creator ---
    let creator = ""
    if (author) {
      creator = author.uniqueId || author.nickname || ""
    }

    // --- Duration ---
    let duration = null
    if (typeof video.duration === "number" && video.duration > 0) {
      duration = String(video.duration)
    }

    // --- Images (Photo Mode) ---
    let images = null
    if (imagePost) {
      const imgs = Array.isArray(imagePost.images) ? imagePost.images : []
      const urls = []
      for (const img of imgs) {
        const iu = img.imageURL || {}
        const ul = iu.urlList || iu.UrlList
        if (Array.isArray(ul) && ul.length > 0) urls.push(ul[0])
      }
      if (urls.length > 0) images = urls
    }

    // --- Music ---
    let musicUrl = null
    if (music) {
      const pu = music.playUrl || {}
      const ul = pu.urlList || pu.UrlList
      if (Array.isArray(ul) && ul.length > 0) musicUrl = ul[0]
    }

    const isPhoto = images && images.length > 0 && !videoUrl

    return {
      type: isPhoto ? "image" : "video",
      description: desc || null,
      creator: creator || null,
      duration,
      thumbnail: thumbnail || null,
      video: videoUrl || null,
      music: musicUrl || null,
      images,
    }
  } catch (_) {
    return null
  }
}

// ====================== Request Handler ======================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)

    // Health check
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
      })
    }

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("Origin") || "") })
    }

    // Only accept POST
    if (request.method !== "POST" || url.pathname !== "/") {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
      })
    }

    // Parse URL from body
    let tiktokUrl
    try {
      const body = await request.json()
      tiktokUrl = (body.url || "").trim()
    } catch (_) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
      })
    }

    if (!tiktokUrl || !TIKTOK_REGEX.test(tiktokUrl)) {
      return new Response(JSON.stringify({ error: "Invalid TikTok URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
      })
    }

    // Scrape
    try {
      const result = await scrapeTikTok(tiktokUrl)

      if (!result.video && (!result.images || result.images.length === 0)) {
        return new Response(JSON.stringify({ error: "No downloadable media found. Please check the URL." }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
        })
      }

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=300",
          ...corsHeaders(request.headers.get("Origin") || ""),
        },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Scraping failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
      })
    }
  },
}
