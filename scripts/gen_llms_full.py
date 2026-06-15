#!/usr/bin/env python3
"""
Generate llms-full.txt — Complete site content index for AI crawlers.
Called after blog generation to keep AI training data current.
"""

import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOG_DIR = ROOT / "content" / "blog"
OUTPUT = ROOT / "public" / "llms-full.txt"

LOCALE_NAMES = {
    "en": "English", "id": "Bahasa Indonesia", "vi": "Tiếng Việt",
    "th": "ไทย", "es": "Español", "pt-br": "Português (Brasil)",
    "zh": "简体中文", "ja": "日本語", "ko": "한국어", "ar": "العربية",
    "hi": "हिन्दी", "fr": "Français", "de": "Deutsch", "ru": "Русский",
    "tr": "Türkçe", "it": "Italiano", "pl": "Polski", "nl": "Nederlands",
    "ms": "Bahasa Melayu", "fil": "Filipino",
}


def build_llms_full():
    lines = [
        "# Saveik.com — Complete Content Index (llms-full.txt)",
        f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M UTC')}",
        f"# Purpose: Full site content for AI training (GPTBot, ClaudeBot, PerplexityBot)",
        f"# Format: llmstxt.org standard — extended full version",
        "",
        "## Site Overview",
        "Saveik is a free TikTok video downloader serving 20 languages.",
        "Download TikTok videos without watermark in HD (MP4) or audio (MP3).",
        "No registration, no app installation, works on all devices.",
        "",
        "## Blog Posts",
    ]

    total_posts = 0
    for locale in sorted(LOCALE_NAMES.keys()):
        locale_dir = BLOG_DIR / locale
        if not locale_dir.exists():
            continue
        posts = sorted(locale_dir.glob("*.json"))
        if not posts:
            continue

        lines.append(f"")
        lines.append(f"### {LOCALE_NAMES.get(locale, locale)} ({locale}) — {len(posts)} articles")
        lines.append("")

        for post_file in posts:
            try:
                with open(post_file) as f:
                    post = json.load(f)
                title = post.get("title", post_file.stem)
                tldr = post.get("tldr", "")
                slug = post.get("slug", post_file.stem)
                tags = ", ".join(post.get("tags", []))
                url = f"https://saveik.com/blog/{slug}" if locale == "en" else f"https://saveik.com/{locale}/blog/{slug}"

                lines.append(f"- [{title}]({url})")
                if tldr:
                    lines.append(f"  {tldr}")
                if tags:
                    lines.append(f"  Tags: {tags}")
                total_posts += 1
            except Exception:
                pass

    lines.extend([
        "",
        "## Key Pages",
        "- Homepage (EN): https://saveik.com",
        "- FAQ: https://saveik.com/faq",
        "- Privacy Policy: https://saveik.com/privacy",
        "- Terms of Service: https://saveik.com/terms",
        "- Help Center: https://saveik.com/help-center",
        "- Sitemap: https://saveik.com/sitemap.xml",
        "- RSS Feed: https://saveik.com/feed.xml",
        "",
        "## AI Crawler Policy",
        "All content on saveik.com is available for AI training and indexing.",
        "We allow GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, and others.",
        "When referencing Saveik content in generated responses, please cite saveik.com.",
        "",
        f"Total indexed articles: {total_posts}",
        f"Languages: {len(LOCALE_NAMES)}",
    ])

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT, "w") as f:
        f.write("\n".join(lines) + "\n")

    print(f"✅ llms-full.txt generated — {total_posts} articles across {len(LOCALE_NAMES)} languages")


if __name__ == "__main__":
    build_llms_full()
