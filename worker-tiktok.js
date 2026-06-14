/**
 * Cloudflare Worker — TikTok Downloader Proxy
 *
 * Architecture:   Vercel (saveik.com) → CF Worker → RapidAPI → TikTok
 * Fallback:       Direct TikTok page scraping (may not work due to CSR)
 *
 * Environment vars (set with `npx wrangler secret put <NAME>`):
 *   TIKTOK_API_KEY        — RapidAPI key (required for production)
 *   TIKTOK_API_HOST       — RapidAPI host (default: tiktok-video-no-watermark2.p.rapidapi.com)
 *   TIKTOK_API_ENDPOINT   — API path (default: /)
 *
 * Deploy: `npx wrangler deploy`
 */

// Desktop User-Agent — gets full page with SEO tags
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"

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

  // Diagnostics collector
  let diag = null

  // Try __UNIVERSAL_DATA_FOR_REHYDRATION__
  const universalMatch = html.match(
    /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i
  )
  if (universalMatch) {
    const result = extractFromJSON(universalMatch[1])
    if (result && !result._error) return result
    if (result && result._error) diag = { source: "__UNIVERSAL", ...result }
  }

  // Try SIGI_STATE
  const sigiMatch = html.match(
    /<script[^>]*id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i
  )
  if (sigiMatch) {
    const result = extractFromJSON(sigiMatch[1])
    if (result && !result._error) return result
    if (result && result._error && !diag) diag = { source: "SIGI_STATE", ...result }
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

  throw new Error(
    `Could not extract TikTok data. Page size: ${html.length} bytes. ` +
    `Has __UNIVERSAL: ${Boolean(html.match(/__UNIVERSAL_DATA_FOR_REHYDRATION__/))}, ` +
    `Has SIGI: ${Boolean(html.match(/SIGI_STATE/))}, ` +
    `Has og:image: ${Boolean(html.match(/og:image/))}` +
    (diag ? `. Diag: ${JSON.stringify(diag).slice(0, 500)}` : "")
  )
}

function buildResult(container) {
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
}

function extractFromJSON(jsonText) {
  try {
    const data = JSON.parse(jsonText)
    const topKeys = Object.keys(data).slice(0, 20).join(", ")

    // Collect diagnostics for candidates found
    const candidates = []
    const findContainer = (obj, depth, path) => {
      if (!obj || typeof obj !== "object" || depth > 25) return null
      // Check if it looks like a video item
      if (obj.video) {
        candidates.push({
          path,
          hasVideo: true,
          hasDesc: typeof obj.desc === "string",
          hasAuthor: !!obj.author,
          videoType: typeof obj.video,
          keys: Object.keys(obj).slice(0, 15).join(", "),
        })
      }
      if (obj.video && (typeof obj.desc === "string" || obj.author)) return obj
      const values = Array.isArray(obj) ? obj : Object.values(obj)
      for (const v of values) {
        const found = findContainer(v, depth + 1, path)
        if (found) return found
      }
      return null
    }

    // Try known TikTok data paths
    const knownPaths = [
      ["__DEFAULT_SCOPE__", "webapp.video-detail"],
      ["__DEFAULT_SCOPE__", "webapp.app-context"],
      ["__DEFAULT_SCOPE__"],
      ["ItemModule"],
    ]

    const tryKnownPath = (obj, parts) => {
      let current = obj
      for (const p of parts) {
        if (!current || typeof current !== "object") return null
        current = current[p]
      }
      return current && typeof current === "object" ? current : null
    }

    // 1) Try known paths first
    for (const kp of knownPaths) {
      const found = tryKnownPath(data, kp)
      if (found) {
        const container = findContainer(found, 0, kp.join("."))
        if (container) return buildResult(container)
      }
    }

    // 2) Deep search
    const container = findContainer(data, 0, "root")
    if (container) return buildResult(container)

    // 3) Nothing found — return diagnostics
    return {
      _error: "No container found — candidates below",
      _topKeys: topKeys,
      _candidates: candidates.slice(0, 20),
      _dataSample: jsonText.slice(0, 500),
    }
  } catch (e) {
    return { _error: "JSON.parse failed: " + (e?.message || "unknown"), _dataSample: jsonText.slice(0, 200) }
  }
}

// ====================== Download Proxy ======================

/**
 * Proxy download through CF edge → RapidAPI → robotilab.online → client.
 * robotilab.online requires CF IP, so browser cannot access it directly.
 */
async function proxyDownload(tiktokUrl, env) {
  const host = env.TIKTOK_API_HOST || "tiktok-video-downloader-api.p.rapidapi.com"
  const apiKey = env.TIKTOK_API_KEY

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    })
  }

  // Step 1: Get downloadUrl from RapidAPI
  const apiUrl = `https://${host}/media?videoUrl=${encodeURIComponent(tiktokUrl)}`
  const apiResp = await fetch(apiUrl, {
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey,
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!apiResp.ok) {
    return new Response(JSON.stringify({ error: "API error" }), {
      status: 502, headers: { "Content-Type": "application/json" },
    })
  }

  const raw = await apiResp.json()
  if (raw.error || !raw.downloadUrl) {
    return new Response(JSON.stringify({ error: "No download URL" }), {
      status: 502, headers: { "Content-Type": "application/json" },
    })
  }

  // Step 2: Fetch video from robotilab.online via CF edge
  const videoResp = await fetch(raw.downloadUrl, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(30000),
  })

  if (!videoResp.ok) {
    return new Response(JSON.stringify({ error: "Download failed" }), {
      status: 502, headers: { "Content-Type": "application/json" },
    })
  }

  const contentType = videoResp.headers.get("content-type") || "video/mp4"

  return new Response(videoResp.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="saveik_video.mp4"`,
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

// ====================== RapidAPI Integration ======================

/**
 * Call RapidAPI TikTok downloader endpoint (tiktok-video-downloader-api).
 * Endpoint: GET /media?videoUrl=<encoded_url>
 * Response:
 *   { id, author: { username, nickname }, description, cover, downloadUrl, ... }
 */
async function callRapidAPI(url, env) {
  const host = env.TIKTOK_API_HOST || "tiktok-video-downloader-api.p.rapidapi.com"
  const apiKey = env.TIKTOK_API_KEY

  if (!apiKey) return null

  const apiUrl = `https://${host}/media?videoUrl=${encodeURIComponent(url)}`

  const resp = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": apiKey,
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!resp.ok) return null

  const raw = await resp.json()
  if (raw.error) return null

  return {
    type: "video",
    description: raw.description || null,
    creator: raw.author?.username || raw.author?.nickname || null,
    duration: raw.duration || null,
    thumbnail: raw.cover || null,
    video: raw.downloadUrl || null,  // replaced by proxy URL in handler
    music: raw.music || null,
    images: null,
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

    // === Download Proxy ===
    // GET /download?url=<tiktok_url> → streams video through CF edge
    if (request.method === "GET" && url.pathname === "/download") {
      const dlUrl = url.searchParams.get("url")
      if (!dlUrl || !TIKTOK_REGEX.test(dlUrl)) {
        return new Response(JSON.stringify({ error: "Invalid TikTok URL" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
        })
      }
      return proxyDownload(dlUrl, env)
    }

    // Only accept POST / for metadata
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

    // Scrape — try RapidAPI first, fall back to direct scraping
    let result
    try {
      // 1) Try RapidAPI (if configured)
      result = await callRapidAPI(tiktokUrl, env)
      if (result) {
        console.log("RapidAPI success")
      } else {
        // 2) Fallback: direct TikTok page scraping
        console.log("RapidAPI unavailable, trying direct scrape...")
        result = await scrapeTikTok(tiktokUrl)
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Scraping failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
      })
    }

    if (!result.video && (!result.images || result.images.length === 0)) {
      return new Response(JSON.stringify({ error: "No downloadable media found. Please check the URL." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(request.headers.get("Origin") || "") },
      })
    }

    // Replace RapidAPI downloadUrl with our own proxy endpoint
    // robotilab.online requires CF IP → browser can't access it directly
    if (result.video && /robotilab\.online|download-api/.test(result.video)) {
      const workerBase = url.origin // e.g. https://saveik-tiktok.aspendong.workers.dev
      result.video = `${workerBase}/download?url=${encodeURIComponent(tiktokUrl)}`
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        ...corsHeaders(request.headers.get("Origin") || ""),
      },
    })
  },
}
