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

ARTICLE_PROMPT = """You are a real person writing a helpful blog post for saveik.com, a free TikTok downloader tool.

Topic: {title}
Keywords to naturally include: {keywords}

CRITICAL WRITING RULES — YOU ARE HUMAN, NOT AI:
1. START WITH A STORY — Open with a specific, relatable scenario. Example:
   "My friend sent me a recipe video on TikTok last night. I wanted to save it for Sunday meal prep, but WiFi at my apartment is terrible. So I needed a way to download it."
   DO NOT start with "In today's digital age..." or "Are you looking for..."

2. WRITE LIKE YOU'RE TEXTING A FRIEND — Short sentences. Contractions. Real opinions. Some paragraphs are just one line. Use "I", "you", "we" naturally.

3. VARY YOUR STRUCTURE — Don't follow a template. Maybe add a quick tip box. Maybe use a comparison. Maybe tell a second mini-story. Keep readers guessing.

4. BE SPECIFIC — Instead of "it's fast", say "took about 15 seconds". Instead of "high quality", say "crystal clear even on my 4K monitor". Real details make it human.

5. ONE UNIQUE INSIGHT — Include at least one thing the reader wouldn't find on every other "how to download TikTok" article. A hidden feature. A workaround. A use case they haven't thought of.

CONTENT MUST INCLUDE (but weave in naturally, not as a checklist):
- Why someone would want to save THIS specific type of video ({keywords})
- How to actually do it with saveik.com (paste link → download → save)
- Mention it works on phone AND computer
- At least 2 genuine-sounding user scenarios
- A subtle mention that MP3 audio extraction is possible too
- End with a natural "if you found this helpful" closing — never pushy

HARD RULES:
- 600-1000 words total
- ALL text in {lang_name}. Keep "Saveik", "TikTok", "MP4", "MP3" untranslated.
- Tone: {tone}
- ZERO marketing jargon. No "unlock", "game-changer", "revolutionary", "seamless".
- Write at an 8th grade reading level. Simple words. Short sentences.

FORMAT — STRICT JSON:
{{
  "slug": "kebab-case-url-slug",
  "locale": "{locale}",
  "title": "Human, curiosity-driven title (not keyword-stuffed)",
  "tldr": "Casual 2-sentence summary like you'd text a friend",
  "description": "Meta description under 155 chars, natural language",
  "datePublished": "{today}",
  "dateModified": "{today}",
  "author": "Saveik Team",
  "tags": ["tiktok", "download", ...2-4 tags],
  "keywords": ["kw1", "kw2", "kw3"],
  "content": "Full article in Markdown. Human-written feel. ## headings for sections.",
  "faq": [
    {{"q": "Real question a person would actually ask?", "a": "Casual answer, not stiff FAQ tone."}},
    {{"q": "Another real question?", "a": "Helpful answer with a tip."}},
    {{"q": "Third question?", "a": "Friendly answer."}}
  ],
  "relatedLinks": [
    {{"label": "Saveik TikTok Downloader", "url": "https://saveik.com/{locale_path}"}}
  ]
}}

Return ONLY valid JSON, no backticks, no explanations.
JSON:"""


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
                    {"role": "system", "content": "You are a professional content writer. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.7,
                max_tokens=8000,
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

            tokens = response.usage.total_tokens if response.usage else 0
            print(f"    ✅ {len(article['content'])} chars, {tokens} tokens")
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
    parser.add_argument("--all", action="store_true", help="为所有20语种各生成1篇")
    parser.add_argument("--dry-run", action="store_true", help="预览模式，不调API")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent

    # Get keywords
    if args.keywords:
        keywords = [k.strip() for k in args.keywords.split(",")]
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