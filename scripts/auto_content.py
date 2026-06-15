#!/usr/bin/env python3
"""
长尾关键词自动发现 + AI 内容生产管线
=====================================
自动发现 TikTok 热门关键词 → 组合语种模板 → LLM 生成博客文章
→ 直接存入 /content/blog/{locale}/ 目录

用法:
  # 自动发现+生成 5 篇英语文章
  python3 scripts/auto_content.py --lang en --count 5

  # 指定关键词生成文章
  python3 scripts/auto_content.py --lang id --keywords "khaby lame,mr beast,舞蹈教程"

  # 批量：所有语种各生成 1 篇
  python3 scripts/auto_content.py --all --count 1

  # 预览模式（不调用 API）
  python3 scripts/auto_content.py --lang zh --count 2 --dry-run

依赖: pip3 install openai
"""

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ============================================================
# 20 语种关键词模板
# ============================================================
LOCALE_TEMPLATES = {
    "en": {
        "formulas": [
            "how to download TikTok video {keyword} without watermark",
            "TikTok {keyword} download no watermark free",
            "download TikTok {keyword} video HD quality",
            "best TikTok downloader for {keyword} 2026",
            "{keyword} TikTok video download MP4 MP3 free",
        ],
        "tone": "professional and helpful",
    },
    "id": {
        "formulas": [
            "cara download video TikTok {keyword} tanpa watermark",
            "download TikTok {keyword} tanpa watermark gratis",
            "cara unduh video TikTok {keyword} kualitas HD",
            "pengunduh TikTok {keyword} terbaik 2026",
            "{keyword} TikTok video download MP4 MP3 gratis",
        ],
        "tone": "friendly and informative in Indonesian",
    },
    "vi": {
        "formulas": [
            "cách tải video TikTok {keyword} không logo",
            "tải TikTok {keyword} không watermark miễn phí",
            "{keyword} TikTok download HD không watermark",
            "trình tải TikTok {keyword} tốt nhất 2026",
            "tải video TikTok {keyword} MP4 MP3",
        ],
        "tone": "friendly and clear in Vietnamese",
    },
    "th": {
        "formulas": [
            "วิธีดาวน์โหลดวิดีโอ TikTok {keyword} ไม่มีลายน้ำ",
            "ดาวน์โหลด TikTok {keyword} ฟรี ไม่มีลายน้ำ",
            "{keyword} TikTok ดาวน์โหลดวิดีโอ HD",
            "ตัวดาวน์โหลด TikTok {keyword} ที่ดีที่สุด 2026",
            "ดาวน์โหลด TikTok {keyword} MP4 MP3 ฟรี",
        ],
        "tone": "friendly and practical in Thai",
    },
    "es": {
        "formulas": [
            "cómo descargar videos de TikTok de {keyword} sin marca de agua",
            "descargar TikTok {keyword} sin watermark gratis",
            "{keyword} descargar video TikTok HD calidad",
            "mejor descargador TikTok {keyword} 2026",
            "descargar video TikTok {keyword} MP4 MP3",
        ],
        "tone": "informal and conversational in Latin American Spanish",
    },
    "pt-br": {
        "formulas": [
            "como baixar vídeo TikTok {keyword} sem marca d'água",
            "baixar TikTok {keyword} sem watermark grátis",
            "{keyword} baixar vídeo TikTok qualidade HD",
            "melhor downloader TikTok {keyword} 2026",
            "baixar vídeo TikTok {keyword} MP4 MP3",
        ],
        "tone": "friendly and direct in Brazilian Portuguese",
    },
    "zh": {
        "formulas": [
            "如何下载{keyword}的TikTok视频无水印",
            "{keyword}TikTok视频无水印免费下载",
            "{keyword}高清TikTok视频下载教程",
            "2026年最好的{keyword}TikTok下载器",
            "{keyword}TikTok视频MP4 MP3下载",
        ],
        "tone": "clear and practical in Simplified Chinese",
    },
    "ja": {
        "formulas": [
            "{keyword}のTikTok動画を透かしなしでダウンロードする方法",
            "{keyword} TikTok ダウンロード 無料 透かしなし",
            "{keyword} TikTok動画 HDダウンロード",
            "2026年{keyword} TikTokダウンローダー おすすめ",
            "{keyword} TikTok MP4 MP3 ダウンロード",
        ],
        "tone": "polite and clear in Japanese",
    },
    "ko": {
        "formulas": [
            "{keyword} 틱톡 동영상 워터마크 없이 다운로드 방법",
            "{keyword} 틱톡 다운로드 무료 워터마크 없음",
            "{keyword} 틱톡 동영상 HD 다운로드",
            "2026년 {keyword} 틱톡 다운로더 추천",
            "{keyword} 틱톡 MP4 MP3 다운로드",
        ],
        "tone": "clear and practical in Korean",
    },
    "ar": {
        "formulas": [
            "{keyword} كيفية تنزيل فيديو TikTok بدون علامة مائية",
            "{keyword} تنزيل TikTok بدون علامة مائية مجانًا",
            "{keyword} تحميل فيديو TikTok بجودة HD",
            "{keyword} أفضل برنامج تنزيل TikTok 2026",
            "{keyword} تحميل TikTok MP4 MP3",
        ],
        "tone": "clear and helpful in Arabic",
    },
    "fr": {
        "formulas": [
            "{keyword} comment télécharger vidéo TikTok sans filigrane",
            "{keyword} télécharger TikTok sans watermark gratuit",
            "{keyword} télécharger vidéo TikTok qualité HD",
            "{keyword} meilleur téléchargeur TikTok 2026",
            "{keyword} télécharger TikTok MP4 MP3",
        ],
        "tone": "clear and helpful in French",
    },
    "de": {
        "formulas": [
            "{keyword} TikTok Video ohne Wasserzeichen herunterladen",
            "{keyword} TikTok Download ohne Wasserzeichen kostenlos",
            "{keyword} TikTok Video HD herunterladen",
            "{keyword} bester TikTok Downloader 2026",
            "{keyword} TikTok MP4 MP3 herunterladen",
        ],
        "tone": "professional and clear in German",
    },
    "ru": {
        "formulas": [
            "{keyword} как скачать видео TikTok без водяного знака",
            "{keyword} скачать TikTok без водяного знака бесплатно",
            "{keyword} скачать видео TikTok HD качество",
            "{keyword} лучший загрузчик TikTok 2026",
            "{keyword} скачать TikTok MP4 MP3",
        ],
        "tone": "clear and practical in Russian",
    },
    "tr": {
        "formulas": [
            "{keyword} TikTok videosu filigransız nasıl indirilir",
            "{keyword} TikTok indirme programsız ücretsiz",
            "{keyword} TikTok video HD indirme",
            "{keyword} en iyi TikTok indirici 2026",
            "{keyword} TikTok MP4 MP3 indir",
        ],
        "tone": "friendly and clear in Turkish",
    },
    "it": {
        "formulas": [
            "{keyword} come scaricare video TikTok senza filigrana",
            "{keyword} scaricare TikTok senza watermark gratis",
            "{keyword} scarica video TikTok qualità HD",
            "{keyword} miglior downloader TikTok 2026",
            "{keyword} scarica TikTok MP4 MP3",
        ],
        "tone": "clear and enthusiastic in Italian",
    },
    "pl": {
        "formulas": [
            "{keyword} jak pobrać wideo TikTok bez znaku wodnego",
            "{keyword} pobierz TikTok bez watermarku za darmo",
            "{keyword} pobierz wideo TikTok jakość HD",
            "{keyword} najlepszy downloader TikTok 2026",
            "{keyword} pobierz TikTok MP4 MP3",
        ],
        "tone": "clear and practical in Polish",
    },
    "nl": {
        "formulas": [
            "{keyword} TikTok video zonder watermerk downloaden",
            "{keyword} TikTok downloaden zonder watermerk gratis",
            "{keyword} TikTok video HD downloaden",
            "{keyword} beste TikTok downloader 2026",
            "{keyword} TikTok MP4 MP3 downloaden",
        ],
        "tone": "direct and clear in Dutch",
    },
    "ms": {
        "formulas": [
            "{keyword} cara muat turun video TikTok tanpa watermark",
            "{keyword} muat turun TikTok tanpa watermark percuma",
            "{keyword} muat turun video TikTok kualiti HD",
            "{keyword} pemuat turun TikTok terbaik 2026",
            "{keyword} muat turun TikTok MP4 MP3",
        ],
        "tone": "friendly and informative in Malay",
    },
    "fil": {
        "formulas": [
            "{keyword} paano mag-download ng TikTok video na walang watermark",
            "{keyword} i-download ang TikTok nang walang watermark libre",
            "{keyword} i-download ang TikTok video HD na kalidad",
            "{keyword} pinakamahusay na TikTok downloader 2026",
            "{keyword} i-download ang TikTok MP4 MP3",
        ],
        "tone": "friendly and clear in Filipino",
    },
    "hi": {
        "formulas": [
            "{keyword} TikTok वीडियो बिना वॉटरमार्क कैसे डाउनलोड करें",
            "{keyword} TikTok डाउनलोड बिना वॉटरमार्क मुफ्त",
            "{keyword} TikTok वीडियो HD डाउनलोड",
            "{keyword} बेस्ट TikTok डाउनलोडर 2026",
            "{keyword} TikTok MP4 MP3 डाउनलोड",
        ],
        "tone": "clear and helpful in Hindi",
    },
}

# Trending TikTok keywords (updated 2026-06)
TRENDING_KEYWORDS = [
    # Viral formats / user intent scenarios
    "storytime", "pov", "grwm", "day in my life",
    "get ready with me", "outfit check", "what I eat in a day",
    "room tour", "morning routine", "night routine",
    "unboxing", "pack with me", "come with me",
    # Practical / how-to intents
    "cooking recipe", "life hack", "study tips", "workout routine",
    "skincare routine", "makeup tutorial", "hair tutorial",
    "phone trick", "productivity tip", "money saving tip",
    # Emotional / entertainment
    "funny pets", "satisfying", "oddly satisfying",
    "wholesome", "feel good", "before and after",
    "dance challenge", "transition", "duet",
    # Content types
    "dance", "comedy", "food", "travel", "fitness",
    "beauty", "fashion", "gaming", "sports", "music",
    "education", "diy", "art", "photography", "vlog",
    # Regional
    "indonesia viral", "brazil dance", "india trending",
    "japan cute", "korea kpop", "mexico humor",
    "saudi funny", "vietnam food", "thailand travel",
]

# ============================================================
# Article Generator
# ============================================================

ARTICLE_PROMPT = """IDENTITY: You're Maya, a 20-something content creator who's been using TikTok since 2020. You write for saveik.com — a free TikTok downloader. You're not a marketer. You're someone who actually uses TikTok daily and helps friends figure out tech stuff.

ARTICLE TOPIC: {title}
MAIN KEYWORD: {keywords}
SEARCH INTENT: Someone searched this because they want to save/use/download TikTok content related to "{keywords}". They want PRACTICAL help, not fluff.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GEO (AI SEARCH) SIGNALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Include these naturally — AI search engines (ChatGPT, Perplexity, Google AI Overviews) prioritize content with concrete data:

1. AT LEAST 1-2 SPECIFIC STATISTICS. Examples:
   - "TikTok has over 1.5 billion monthly active users (DataReportal, 2026)"
   - "Over 60% of TikTok users save videos for offline viewing"
   - "Dance challenge videos average 2-5 million views on TikTok"
   - Make up reasonable estimates if needed, but frame as "roughly" or "approximately"

2. NAME YOUR SOURCE naturally in the text:
   - "According to TikTok's Creator Portal..." or "A recent survey found..."
   - Don't use formal citation format — weave it in conversationally

3. INCLUDE A "QUICK FACTS" section somewhere in the article:
   Example:
   ## Quick Facts
   - TikTok users spend an average of 95 minutes per day on the app
   - The most downloaded video categories are dance (38%), comedy (22%), and cooking (15%)
   - Saveik processes downloads in under 15 seconds on average

4. ADMIT LIMITATIONS — AI engines reward honest content:
   - "This won't work for private accounts..."
   - "If the video is region-locked, try..."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL WRITING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOU ARE A REAL PERSON. WRITE LIKE ONE:

1. OPEN WITH LIFE, NOT SEO.
   GOOD: "Last week my cousin sent me 6 TikToks in 10 minutes. All {keywords}. I couldn't keep up — couldn't save them, couldn't find them later. So I figured out a system."
   BAD: "In the digital era, TikTok content has become increasingly popular." ❌
   BAD: "Are you looking for ways to download..." ❌

2. BREAK THE RULES OF "GOOD WRITING":
   - Use fragments. Like this.
   - Start sentences with "And" or "But" or "So".
   - One-sentence paragraphs. Yes, just one.
   - Say "kinda", "pretty much", "honestly" — real people talk like this.
   - Use parentheticals (like this) because that's how brains actually work.
   - Throw in a tangent occasionally, then come back.

3. BE WRONGLY SPECIFIC:
   Not "it's fast" → "I timed it and it was like 12 seconds"
   Not "good quality" → "looks clean even when I cast it to my TV"
   Not "many users" → "3 of my friends tried it"

4. AVOID THESE AI TELLS (Google WILL detect these):
   - "In conclusion..." / "To summarize..." / "As we've seen..."
   - "Moreover" / "Furthermore" / "Additionally" / "Consequently"
   - Perfect paragraph lengths (mix 1-line, 3-line, 6-line)
   - "It's worth noting that..." / "One might consider..."
   - Lists that are exactly 3 or exactly 5 items
   - "Whether you're a beginner or expert..."
   - "In today's fast-paced world..." / "Now more than ever..."

5. STRUCTURE SHOULD FEEL ACCIDENTAL:
   Not: Intro → Point 1 → Point 2 → Point 3 → Conclusion
   But: Story → tangent → main tip → another story → practical steps → "oh by the way" tip → wrap-up

6. EEAT SIGNALS (natural, not forced):
   - Mention when you first discovered the thing ("I found this trick back in March...")
   - Admit limitations ("this won't work for... but here's what does")
   - Link to saveik.com naturally, like: "I use saveik.com for this — it's free and you don't need an app"
   - Show you've tried alternatives ("I tested 4 different downloaders and this was the only one that...")

CONTENT REQUIREMENTS:
- Why someone wants "{keywords}" content saved (the real reason, not generic)
- How saveik.com solves this (paste link, download, done — be specific about seconds/steps)
- Works on phone (iPhone + Android) AND computer — but mention naturally
- 2-3 real-sounding scenarios ("A friend who's a dance teacher uses this to...")
- One thing nobody else mentions about downloading {keywords} content
- Mention MP3 extraction as an "oh and you can also grab just the audio if you want"
- End mid-thought, not with a bow. Like: "Anyway, give it a shot if you're dealing with the same thing."

FORMATTING RULES:
- Language: {lang_name} only. Keep "Saveik", "TikTok", "MP4", "MP3" in English.
- Tone: {tone}
- Length: 700-1100 words (shorter than 700 = too thin for Google)
- Reading level: 7th-9th grade. Simple words. Real sentences.
- ZERO of: "unlock", "game-changer", "revolutionary", "seamless", "leverage", "robust", "cutting-edge"

JSON OUTPUT:
{{
  "slug": "kebab-case-url-like-this",
  "locale": "{locale}",
  "title": "Curiosity-driven, specific title. Example: 'I Finally Found a Way to Save Those Cooking TikToks Without Losing Quality' — not 'Best TikTok Downloader for Recipes'",
  "tldr": "2 casual sentences summarizing the article, like you're telling a friend what it's about",
  "description": "Meta description under 155 chars, natural language, answers 'what will I learn?'",
  "datePublished": "{today}",
  "dateModified": "{today}",
  "author": "Saveik Team",
  "tags": ["tiktok", "download", 2-3 more specific tags],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "content": "Full Markdown article. H2 headings. No H1 (title is separate). Vary paragraph length. Some 1-liners. Natural voice.",
  "faq": [
    {{"q": "A real question someone would actually type into Google", "a": "Casual answer. Not robotic. Include a small tip."}},
    {{"q": "Another real question", "a": "Another helpful answer"}},
    {{"q": "A third question", "a": "Friendly answer with personal experience"}}
  ],
  "relatedLinks": [
    {{"label": "Saveik TikTok Downloader", "url": "https://saveik.com/{locale_path}"}}
  ]
}}

CRITICAL: Return ONLY valid JSON. No markdown fences, no explanations, no notes outside the JSON object.
"""


def get_api_client():
    try:
        from openai import OpenAI
    except ImportError:
        print("❌ pip3 install openai")
        sys.exit(1)

    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("DEEPSEEK_API_KEY")
    if not api_key:
        print("❌ 设置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY 环境变量")
        sys.exit(1)

    base_url = os.environ.get("OPENAI_BASE_URL", "https://api.deepseek.com/v1")
    model = os.environ.get("LLM_MODEL", "deepseek-chat")

    return OpenAI(api_key=api_key, base_url=base_url), model


def check_article_quality(article: dict) -> dict:
    """Post-generation quality check — detects AI fingerprints.
    Returns {"pass": bool, "reason": str, "score": int}
    """
    content = article.get("content", "")
    title = article.get("title", "")
    issues = []

    # 1. Word count check (>= 700)
    words = len(content.split())
    if words < 550:
        issues.append(f"too short ({words} words, need 550+)")
    elif words < 700:
        issues.append(f"borderline short ({words} words)")

    # 2. AI buzzword detection
    ai_patterns = [
        r"\bin conclusion\b", r"\bto summarize\b", r"\bas we('ve| have) seen\b",
        r"\bmoreover\b", r"\bfurthermore\b", r"\badditionally\b", r"\bconsequently\b",
        r"\bit('s| is) worth noting\b", r"\bon the other hand\b",
        r"\bin today('s|) digital (age|era|world|landscape)\b",
        r"\bwhether you('re| are) a\b", r"\bwithout further ado\b",
        r"\bgame-changer\b", r"\brevolutionary\b", r"\bseamless(ly)?\b",
        r"\bunlock\b", r"\bleverage\b", r"\brobust\b", r"\bcutting-edge\b",
        r"\bharness\b", r"\bdelves? into\b", r"\bexplores?\b.*\brealm\b",
    ]
    found_patterns = []
    for pat in ai_patterns:
        if re.search(pat, content, re.IGNORECASE):
            found_patterns.append(pat.replace(r"\b", "").replace(r"(\b)?", ""))
    if len(found_patterns) >= 3:
        issues.append(f"AI patterns: {', '.join(found_patterns[:3])}")
    elif found_patterns:
        pass  # 1-2 is okay, just note it

    # 3. H2 heading count (need 3-8 for structure)
    headings = re.findall(r"^#{1,3}\s", content, re.MULTILINE)
    if len(headings) < 2:
        issues.append("too few headings")
    if len(headings) > 15:
        issues.append("too many headings (looks AI-generated)")

    # 4. Paragraph variety check
    paragraphs = [p.strip() for p in content.split("\n\n") if p.strip() and not p.strip().startswith("#")]
    if len(paragraphs) >= 3:
        lengths = [len(p.split()) for p in paragraphs]
        avg_len = sum(lengths) / len(lengths)
        # Detect if all paragraphs are roughly the same length (AI tell)
        if lengths and max(lengths) - min(lengths) < 10 and avg_len > 20:
            issues.append("paragraphs too uniform (AI fingerprint)")

    # 5. Title quality
    if len(title) < 15:
        issues.append("title too short")
    if title.lower().startswith(("best ", "top ", "how to ", "ultimate ")):
        pass  # These are common and fine for SEO
    if title.split()[0].lower() in ["the", "a", "an"] and len(title) < 40:
        pass

    passed = len(issues) <= 1 or (len(issues) == 1 and "borderline" in issues[0])
    return {
        "pass": passed,
        "reason": "; ".join(issues) if issues else "ok",
        "score": max(5 - len(issues), 1),
    }


def generate_article(
    client, model, locale: str, keyword: str, dry_run: bool = False
) -> dict | None:
    """Generate a single blog article via LLM."""
    template = LOCALE_TEMPLATES.get(locale)
    if not template:
        print(f"  ⚠️  未知语种: {locale}")
        return None

    # Pick a random formula and build title
    import random

    formula = random.choice(template["formulas"])
    title = formula.replace("{keyword}", keyword).strip()
    # Capitalize first letter
    title = title[0].upper() + title[1:] if title else title

    locale_map = {
        "en": ("English", ""), "id": ("Indonesian", "id"), "vi": ("Vietnamese", "vi"),
        "th": ("Thai", "th"), "es": ("Spanish", "es"), "pt-br": ("Portuguese (BR)", "pt-br"),
        "zh": ("Chinese (Simplified)", "zh"), "ja": ("Japanese", "ja"), "ko": ("Korean", "ko"),
        "ar": ("Arabic", "ar"), "hi": ("Hindi", "hi"), "fr": ("French", "fr"),
        "de": ("German", "de"), "ru": ("Russian", "ru"), "tr": ("Turkish", "tr"),
        "it": ("Italian", "it"), "pl": ("Polish", "pl"), "nl": ("Dutch", "nl"),
        "ms": ("Malay", "ms"), "fil": ("Filipino", "fil"),
    }
    lang_name, lang_locale = locale_map.get(locale, (locale, locale))
    locale_path = lang_locale if lang_locale else ""

    today = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    prompt = ARTICLE_PROMPT.format(
        lang_name=lang_name,
        lang_native=locale,
        title=title,
        keywords=keyword,
        locale=locale,
        today=today,
        locale_path=locale_path,
        tone=template["tone"],
    )

    if dry_run:
        print(f"  🔍 DRY RUN: {title}")
        return None

    print(f"  🤖 生成: {title}")

    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are Maya — a 20-something creator who writes real, personal blog posts. You write like a human who actually uses TikTok, not like a marketer or SEO robot. Your writing has personality: fragments, tangents, real opinions. You return ONLY valid JSON, no markdown fences."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.88,
                max_tokens=8000,
                frequency_penalty=0.3,
                presence_penalty=0.3,
            )

            raw = response.choices[0].message.content.strip()
            if raw.startswith("```"):
                raw = re.sub(r"^```(?:json)?\s*\n", "", raw)
                raw = re.sub(r"\n```\s*$", "", raw)

            article = json.loads(raw)

            # Validate required fields
            required = ["slug", "title", "tldr", "description", "content", "faq"]
            missing = [k for k in required if k not in article]
            if missing:
                print(f"    ⚠️  缺少字段: {missing}")
                if attempt < 2:
                    time.sleep(2)
                    continue
                return None

            # Auto-generate slug if missing/empty
            if not article.get("slug"):
                article["slug"] = re.sub(r"[^a-z0-9-]", "", title.lower().replace(" ", "-")[:80])

            article["locale"] = locale

            # ── Quality check: detect AI fingerprints ──
            quality = check_article_quality(article)
            if not quality["pass"] and attempt < 2:
                print(f"    ⚠️  Quality fail ({quality['reason']}), retrying...")
                time.sleep(2)
                continue
            if not quality["pass"]:
                print(f"    ⚠️  Quality issues (using anyway): {quality['reason']}")

            tokens = response.usage.total_tokens if response.usage else 0
            words = len(article['content'].split()) if article.get('content') else 0
            print(f"    ✅ {words} words, {tokens} tokens")
            return article

        except json.JSONDecodeError as e:
            print(f"    ❌ JSON 错误 (尝试 {attempt+1}/3): {e}")
            time.sleep(2)
        except Exception as e:
            print(f"    ❌ API 错误 (尝试 {attempt+1}/3): {e}")
            time.sleep(3)

    return None


def save_article(project_root: Path, article: dict):
    """Save article to content/blog/{locale}/{slug}.json"""
    locale = article["locale"]
    slug = article.get("slug", "untitled")

    dir_path = project_root / "content" / "blog" / locale
    dir_path.mkdir(parents=True, exist_ok=True)

    file_path = dir_path / f"{slug}.json"
    with open(file_path, "w") as f:
        json.dump(article, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"    📁 已保存: content/blog/{locale}/{slug}.json")


def main():
    parser = argparse.ArgumentParser(
        description="长尾关键词自动发现 + AI 内容生产管线",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--lang", default="en", help="目标语种代码")
    parser.add_argument("--count", type=int, default=1, help="生成文章数量")
    parser.add_argument("--keywords", help="指定关键词，逗号分隔 (默认自动选择)")
    parser.add_argument("--keywords-file", help="从 JSON 文件读取关键词（trend_hunter.py 输出）")
    parser.add_argument("--today", action="store_true", help="使用今日热点关键词（自动调用 trend_hunter）")
    parser.add_argument("--all", action="store_true", help="为所有20语种各生成1篇")
    parser.add_argument("--dry-run", action="store_true", help="预览模式，不调API")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent

    # Get keywords
    if args.keywords:
        keywords = [k.strip() for k in args.keywords.split(",")]
    elif args.keywords_file:
        try:
            with open(args.keywords_file) as f:
                data = json.load(f)
            keywords = data.get("keywords", [])
            print(f"📂 Loaded {len(keywords)} keywords from {args.keywords_file}")
        except Exception as e:
            print(f"⚠️  Failed to load keywords file: {e}, using defaults")
            keywords = random.sample(TRENDING_KEYWORDS, min(args.count * 2, len(TRENDING_KEYWORDS)))
    elif args.today:
        # Auto-run trend_hunter as subprocess
        try:
            trend_script = project_root / "scripts" / "trend_hunter.py"
            import subprocess
            result = subprocess.run(
                ["python3", str(trend_script), "--json"],
                capture_output=True, text=True, timeout=30,
                cwd=str(project_root)
            )
            # Read the JSON output file
            cache = project_root / "data" / "trending_keywords.json"
            if cache.exists():
                with open(cache) as f:
                    data = json.load(f)
                keywords = data.get("keywords", [])
                print(f"🔥 Today's trending keywords: {len(keywords)}")
            if not keywords:
                keywords = random.sample(TRENDING_KEYWORDS, min(args.count * 2, len(TRENDING_KEYWORDS)))
        except Exception as e:
            print(f"⚠️  Trend hunter failed: {e}, using defaults")
            keywords = random.sample(TRENDING_KEYWORDS, min(args.count * 2, len(TRENDING_KEYWORDS)))
    else:
        import random
        keywords = random.sample(TRENDING_KEYWORDS, min(args.count * 2, len(TRENDING_KEYWORDS)))

    locales = list(LOCALE_TEMPLATES.keys()) if args.all else [args.lang]

    print(f"\n{'='*60}")
    print(f"📝 Saveik 长尾内容生产管线")
    print(f"{'='*60}")
    print(f"🌍 语种: {', '.join(locales)}")
    print(f"🔑 关键词池: {len(keywords)} 个")
    print(f"📄 目标: {args.count} 篇/语种")
    print()

    if not args.dry_run:
        client, model = get_api_client()
        print(f"🤖 模型: {model}\n")

    total = 0
    for locale in locales:
        print(f"--- {locale} ---")
        for i in range(min(args.count, len(keywords))):
            kw = keywords[i]
            article = generate_article(
                client if not args.dry_run else None,
                model if not args.dry_run else "",
                locale, kw, args.dry_run
            )
            if article:
                save_article(project_root, article)
                total += 1
            time.sleep(1)  # Rate limit
        print()

    print(f"{'='*60}")
    if args.dry_run:
        print(f"🔍 预览完成 — {args.count * len(locales)} 篇待生成")
    else:
        print(f"✅ 已生成 {total} 篇文章")
    print(f"📁 目录: content/blog/")
    print(f"\n下一步:")
    print(f"  npx next build  # 重新构建以包含新文章")
    print(f"  npm run dev     # 浏览 /{args.lang}/blog/{keywords[0].replace(' ', '-')}")


if __name__ == "__main__":
    main()