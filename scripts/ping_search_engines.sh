#!/bin/bash
# ============================================================
# Ping search engines with updated sitemap
# Run: bash scripts/ping_search_engines.sh
# ============================================================
SITEMAP="https://www.saveik.com/sitemap.xml"

echo "📡 Pinging search engines..."

# Google
echo -n "  Google: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.google.com/ping?sitemap=${SITEMAP}")
echo "$STATUS"

# Bing / IndexNow (Bing + Yandex + Seznam use IndexNow)
echo -n "  Bing (IndexNow): "
KEY="b19e9e8e8e9e4a1f8e9e8e9e8e9e8e9e"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bing.com/indexnow?url=https://www.saveik.com&key=${KEY}")
echo "$STATUS"

echo "✅ Done — sitemap pinged"
