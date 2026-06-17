"""
Translate tool page configs to all PSEO languages via DeepSeek.
Output: content/seo/tool-translations.json
"""
import json, urllib.request, ssl, time, os, sys

ssl._create_default_https_context = ssl._create_unverified_context
API_KEY = os.environ.get("OPENAI_API_KEY", "sk-c69119220bf34737a100dbc7c2a379a1")

# Source: English tool pages
SOURCE = [
    {"slug":"youtube-to-blog-post","title":"YouTube to Blog Post - AI One-Click Generator | ailomo","description":"Convert YouTube videos into high-quality blog posts instantly. AI transcription + rewriting, preserves original meaning while optimizing structure.","h1":"Turn YouTube Videos Into Blog Posts Instantly","badge":"YouTube → Blog Post","ogTitle":"YouTube to Blog Post - AI One-Click Generator","ogDescription":"Convert YouTube videos into SEO-optimized blog posts with AI transcription and rewriting.","features":[{"title":"AI Rewriting","desc":"Not just transcription — AI understands content and reorganizes it for blog readability"},{"title":"SEO Optimized","desc":"Auto-generates SEO-friendly titles, meta descriptions, and keyword-rich content"},{"title":"Multi-Language","desc":"Detect source language and translate output to 20+ languages"},{"title":"Lightning Fast","desc":"10-minute video transcribed and article generated in under 1 minute"}]},
    {"slug":"video-to-twitter-thread","title":"Video to Twitter/X Thread - AI Auto Generator | ailomo","description":"Transform video content into engaging Twitter/X threads. AI extracts key insights and creates Hook + points + CTA structure.","h1":"Turn Videos Into Viral Twitter/X Threads","badge":"Video → Twitter Thread","ogTitle":"Video to Twitter/X Thread - AI Auto Generator","ogDescription":"Transform video content into Twitter/X threads with AI — Hook + insights + CTA.","features":[{"title":"AI Hook Generator","desc":"Auto-creates attention-grabbing first tweet"},{"title":"Insight Extraction","desc":"Extracts 6-12 key points under 280 characters each"},{"title":"Auto CTA","desc":"Ends with engagement-driving call-to-action"},{"title":"Instant Output","desc":"Paste a link, get a complete thread in 10 seconds"}]},
    {"slug":"video-to-xiaohongshu","title":"Video to Xiaohongshu Note - AI Style Generator | ailomo","description":"Turn videos into Xiaohongshu-style notes. AI generates emoji-rich review-style content with trending hashtags.","h1":"Turn Videos Into Xiaohongshu (RED) Notes","badge":"Video → Xiaohongshu Note","ogTitle":"Video to Xiaohongshu Note - AI Generator","ogDescription":"Turn videos into Xiaohongshu notes with emoji style + trending hashtags.","features":[{"title":"Review Style","desc":"Auto-generates authentic review-style copy that feels personal"},{"title":"Emoji Polish","desc":"Smart emoji placement for warmth and engagement"},{"title":"Trending Hashtags","desc":"Auto-matches relevant topic hashtags for visibility"},{"title":"Mobile Format","desc":"One line per sentence, optimized for phone reading"}]},
]

LANGS = {
    "ja":"Japanese","ko":"Korean","es":"Spanish","fr":"French",
    "de":"German","pt":"Portuguese","ar":"Arabic","hi":"Hindi",
    "id":"Indonesian","th":"Thai","vi":"Vietnamese","ru":"Russian",
    "it":"Italian","tr":"Turkish","pl":"Polish","nl":"Dutch",
    "sv":"Swedish","fil":"Filipino"
}

existing = {}
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "content", "seo", "tool-translations.json")
os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

for lang_code, lang_name in LANGS.items():
    print(f"\n[{lang_code}] {lang_name}...", flush=True)
    result = {}
    
    for tool in SOURCE:
        prompt = f"""Translate this tool page metadata from English to {lang_name}.
Rules: Keep "ailomo" and product names unchanged. Keep URL slugs unchanged.
Keep placeholder formats like "→" unchanged. Return ONLY a JSON object, no markdown.

Source JSON:
{json.dumps({k:v for k,v in tool.items() if k != 'slug'}, ensure_ascii=False, indent=2)}

Return ONLY: {{"title":"...","description":"...","h1":"...","badge":"...","ogTitle":"...","ogDescription":"...","features":[{{"title":"...","desc":"..."}},...]}}
"""
        data = json.dumps({
            "model":"deepseek-chat","messages":[{"role":"system","content":"Professional translator. Output ONLY valid JSON."},{"role":"user","content":prompt}],
            "temperature":0.1,"max_tokens":2000
        }).encode()
        
        try:
            req = urllib.request.Request("https://api.deepseek.com/chat/completions", data=data,
                headers={"Content-Type":"application/json","Authorization":f"Bearer {API_KEY}"})
            resp = urllib.request.urlopen(req, timeout=60)
            content = json.loads(resp.read())["choices"][0]["message"]["content"].strip()
            content = content.replace("```json","").replace("```","").strip()
            translated = json.loads(content)
            translated["slug"] = tool["slug"]
            result[tool["slug"]] = translated
            print(f"  ✅ {tool['slug']}", end=" ", flush=True)
        except Exception as e:
            print(f"  ❌ {tool['slug']}: {str(e)[:60]}", flush=True)
            result[tool["slug"]] = {**tool, "slug": tool["slug"]}  # fallback to English
        
        time.sleep(1)  # rate limit
    
    existing[lang_code] = result

# Save
with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print(f"\n✅ Saved {sum(len(v) for v in existing.values())} tool translations to {OUT_PATH}")
