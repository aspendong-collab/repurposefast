/**
 * Cloudflare Worker — TikTok API Proxy
 *
 * Deploy at: https://dash.cloudflare.com → Workers & Pages → Create
 *
 * What it does:
 *   Receives requests from Vercel (US), relays them from Cloudflare's
 *   Singapore edge node to Indonesian TikTok downloader APIs,
 *   bypassing geo-based Cloudflare challenges.
 *
 * Usage from route.ts:
 *   fetch("https://tiktok-proxy.YOUR-DOMAIN.workers.dev/proxy", {
 *     method: "POST",
 *     body: JSON.stringify({
 *       provider: "zell",    // or "sanka" or "tikwm"
 *       url: "https://tikwm.com/api/"
 *     }),
 *   })
 */

export default {
  async fetch(request) {
    const url = new URL(request.url)

    // Allow only POST to /proxy
    if (request.method !== "POST" || url.pathname !== "/proxy") {
      return new Response("Not Found", { status: 404 })
    }

    let body
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { provider, url: targetUrl } = body

    if (!provider || !targetUrl) {
      return new Response(
        JSON.stringify({ error: "Missing provider or url" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Build the provider-specific request
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "application/json, text/plain, */*",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
    }

    // Build the body for the provider
    const params = new URLSearchParams()
    params.set("url", body.tiktokUrl || "")
    if (provider === "tikwm") params.set("hd", "1")

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers,
        body: params.toString(),
      })

      const contentType = res.headers.get("content-type") || ""
      const text = await res.text()

      // Try to parse as JSON
      if (contentType.includes("json")) {
        try {
          const json = JSON.parse(text)
          return new Response(JSON.stringify(json), {
            status: res.status,
            headers: { "Content-Type": "application/json" },
          })
        } catch {
          // fall through
        }
      }

      return new Response(text, {
        status: res.status,
        headers: { "Content-Type": contentType },
      })
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Proxy request failed",
          detail: err.message,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      )
    }
  },
}
