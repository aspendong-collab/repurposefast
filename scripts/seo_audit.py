#!/usr/bin/env python3
"""Saveik SEO Audit with proper browser UA (bypass Cloudflare)"""
import subprocess, json

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
SITE = "https://www.saveik.com"
LOCALES = ["en","id","vi","th","es","pt-br","zh","ja","ko","ar","hi","fr","de","ru","tr","it","pl","nl","ms","fil"]

def curl(url):
    result = subprocess.run(["curl", "-s", "-A", UA, "-w", "%{http_code}", "-o", "/tmp/audit_tmp", url],
                          capture_output=True, text=True, timeout=20)
    try:
        with open("/tmp/audit_tmp") as f:
            body = f.read()
    except:
        body = ""
    return body, result.stdout.strip()

print("=" * 70)
print("🔍 SAVEIK FULL SEO AUDIT")
print("=" * 70)

# 1. Homepage SEO
print("\n--- 1. HOMEPAGE SEO (first 10 locales) ---")
import re
for lang in LOCALES[:10]:
    url = SITE if lang == "en" else f"{SITE}/{lang}"
    html, code = curl(url)
    title_m = re.search(r'<title>([^<]+)</title>', html)
    desc_m = re.search(r'<meta name="description" content="([^"]*)"', html)
    title = title_m.group(1) if title_m else "❌ MISSING"
    desc = (desc_m.group(1)[:80] + "...") if desc_m else "❌ MISSING"
    print(f"  [{code}] {lang:6s} | {title[:65]}")

# 2. Sitemap
print("\n--- 2. SITEMAP ---")
html, code = curl(f"{SITE}/sitemap.xml")
urls = re.findall(r'<loc>(https://[^<]+)</loc>', html)
bad = [u for u in urls if '\u3002' in u or 'vercel.app' in u]
print(f"  Status: {code} | URLs: {len(urls)} | Invalid: {len(bad)}")

# 3. Blog Posts
blog_urls = [u for u in urls if '/blog/' in u]
blog_locales = set()
for u in blog_urls:
    parts = u.replace(SITE+"/", "").split("/")
    if parts:
        blog_locales.add(parts[0])
print(f"  Blog URLs: {len(blog_urls)} | Locales with blog: {len(blog_locales)}")

# 4. Schema
html, code = curl(SITE)
schemas = set(re.findall(r'"@type":\s*"(\w+)"', html))
print(f"\n--- 3. SCHEMA ---")
print(f"  Types: {schemas if schemas else '❌ NONE'}")

# 5. Robots.txt
html, code = curl(f"{SITE}/robots.txt")
print(f"\n--- 4. ROBOTS.TXT ---")
print(f"  Status: {code} | Lines: {len(html.split(chr(10)))}")

# 6. Page Size
html, code = curl(SITE)
print(f"\n--- 5. PAGE SIZE ---")
print(f"  HTML: {len(html)/1024:.1f} KB | Status: {code}")

# 7. Hreflang
hreflangs = re.findall(r'hreflang="([^"]+)"', html)
print(f"\n--- 6. HREFLANG ---")
print(f"  Tags: {len(hreflangs)} | Sample: {hreflangs[:8]}")

print("\n" + "=" * 70)
print("AUDIT COMPLETE — Analyzing gaps...")
print("=" * 70)
