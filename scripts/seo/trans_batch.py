#!/usr/bin/env python3
"""Batch translate tool page badges/titles to all PSEO languages."""
import json, urllib.request, ssl, time, os
ssl._create_default_https_context = ssl._create_unverified_context
API = "sk-c69119220bf34737a100dbc7c2a379a1"

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "content", "seo", "tool-translations.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

# Minimal translatable fields per tool
tools = {
    "youtube-to-blog-post": {"title":"YouTube to Blog Post | ailomo","badge":"YouTube → Blog Post","h1":"Turn YouTube Videos Into Blog Posts"},
    "video-to-twitter-thread": {"title":"Video to Twitter/X Thread | ailomo","badge":"Video → Twitter Thread","h1":"Turn Videos Into Twitter/X Threads"},
    "video-to-xiaohongshu": {"title":"Video to Xiaohongshu Note | ailomo","badge":"Video → Xiaohongshu Note","h1":"Turn Videos Into Xiaohongshu Notes"},
    "video-to-linkedin-post": {"title":"Video to LinkedIn Post | ailomo","badge":"Video → LinkedIn Post","h1":"Turn Videos Into LinkedIn Posts"},
    "podcast-to-article": {"title":"Podcast to Article | ailomo","badge":"Podcast → Article","h1":"Turn Podcasts Into Articles"},
    "video-to-seo-article": {"title":"Video to SEO Article | ailomo","badge":"Video → SEO Article","h1":"Turn Videos Into SEO Articles"},
    "audio-to-text": {"title":"Audio to Text | ailomo","badge":"Audio → Text","h1":"Convert Audio to Text"},
    "video-to-subtitle": {"title":"Video to Subtitle | ailomo","badge":"Video → Subtitle","h1":"Generate Subtitles From Video"},
    "meeting-to-notes": {"title":"Meeting to Notes | ailomo","badge":"Meeting → Notes","h1":"Turn Meetings Into Actionable Notes"},
    "interview-transcript": {"title":"Interview to Transcript | ailomo","badge":"Interview → Transcript","h1":"Turn Interviews Into Transcripts"},
    "video-content-repurposing": {"title":"Video Content Repurposing | ailomo","badge":"Video → All Platforms","h1":"One Video for All Platforms"},
    "mp4-to-text": {"title":"MP4 to Text | ailomo","badge":"MP4 → Text","h1":"Extract Text From MP4 Videos"},
}

LANGS = {
    "ko":"Korean","es":"Spanish","fr":"French","de":"German",
    "pt":"Portuguese","ar":"Arabic","hi":"Hindi","id":"Indonesian",
    "th":"Thai","vi":"Vietnamese","ru":"Russian","it":"Italian",
    "tr":"Turkish","pl":"Polish","nl":"Dutch","sv":"Swedish","fil":"Filipino"
}

# Load existing
existing = {}
if os.path.exists(OUT):
    existing = json.load(open(OUT))

for lc, ln in LANGS.items():
    if lc in existing and len(existing[lc]) >= 10:
        print(f"[{lc}] {ln} — already done, skipped")
        continue
    
    prompt = f"""Translate ALL values in this JSON to {ln}. Keep "ailomo" unchanged. Keep "→" unchanged. Return ONLY valid JSON with the same structure, no markdown, no explanation.

{json.dumps(tools, ensure_ascii=False)}"""
    
    data = json.dumps({
        "model":"deepseek-chat",
        "messages":[{"role":"system","content":"Professional translator. Output ONLY JSON, no markdown."},{"role":"user","content":prompt}],
        "temperature":0.1,"max_tokens":4000
    }).encode()
    
    try:
        req = urllib.request.Request("https://api.deepseek.com/chat/completions", data=data,
            headers={"Content-Type":"application/json","Authorization":f"Bearer {API}"})
        resp = urllib.request.urlopen(req, timeout=60)
        content = json.loads(resp.read())["choices"][0]["message"]["content"].strip()
        content = content.replace("```json","").replace("```","").strip()
        result = json.loads(content)
        existing[lc] = result
        print(f"  [{lc}] ✅ {len(result)} tools")
    except Exception as e:
        print(f"  [{lc}] ❌ {str(e)[:80]}")
        existing[lc] = tools
    time.sleep(2)

json.dump(existing, open(OUT, 'w'), ensure_ascii=False, indent=2)
print(f"\nDone: {len(existing)} languages, {sum(len(v) for v in existing.values())} tool entries → {OUT}")
