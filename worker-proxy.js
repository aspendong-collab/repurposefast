/**
 * Cloudflare Worker — TikTok API Proxy
 * Deploy at: https://dash.cloudflare.com → Workers & Pages → tiktok-proxy
 */

export default {
  async fetch(request) {
    const url = new URL(request.url)

    // Health check
    if (request.method === "GET" && url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, region: request.cf?.colo || "unknown" }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Proxy endpoint
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

    const { provider, url: targetUrl, tiktokUrl } = body
    if (!provider || !targetUrl) {
      return new Response(JSON.stringify({ error: "Missing provider or url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const params = new URLSearchParams()
    params.set("url", tiktokUrl || "")
    if (provider === "tikwm") params.set("hd", "1")

    const colo = request.cf?.colo || "unknown"

    try {
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Accept: "application/json, text/plain, */*",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36",
        },
        body: params.toString(),
      })

      const resText = await res.text()

      let json
      try {
        json = JSON.parse(resText)
      } catch {
        return new Response(
          JSON.stringify({
            error: `Provider returned non-JSON (HTTP ${res.status})`,
            provider,
            colo,
            preview: resText.substring(0, 200),
          }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        )
      }

      return new Response(JSON.stringify({ ...json, _proxyColo: colo }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Proxy connection failed",
          provider,
          colo,
          detail: err.message,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      )
    }
  },
}
