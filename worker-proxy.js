/**
 * Cloudflare Worker — TikTok API Proxy
 * Deploy: Cloudflare Workers → tiktok-proxy → Edit Code → paste → Deploy
 */

export default {
  async fetch(request) {
    var url = new URL(request.url)

    if (request.method === "GET" && url.pathname === "/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    if (request.method !== "POST" || url.pathname !== "/proxy") {
      return new Response("Not Found", { status: 404 })
    }

    var body
    try {
      body = await request.json()
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    var method = body.method || "POST"
    var targetUrl = body.url
    var provider = body.provider || "unknown"

    if (!targetUrl) {
      return new Response(JSON.stringify({ error: "Missing url" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    var fetchHeaders = {
      Accept: "application/json, text/plain, */*",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36",
    }

    var fetchBody = null

    if (method === "POST") {
      fetchHeaders["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8"
      if (body.body) {
        fetchBody = body.body
      }
    }

    try {
      var res = await fetch(targetUrl, {
        method: method,
        headers: fetchHeaders,
        body: fetchBody,
      })

      var resText = await res.text()

      var json
      try {
        json = JSON.parse(resText)
      } catch (e) {
        return new Response(
          JSON.stringify({
            error: "Provider returned non-JSON",
            httpStatus: res.status,
            preview: resText.substring(0, 300),
          }),
          { status: 502, headers: { "Content-Type": "application/json" } }
        )
      }

      return new Response(JSON.stringify(json), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      })
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "Proxy connection failed",
          provider: provider,
          detail: err.message,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      )
    }
  },
}
