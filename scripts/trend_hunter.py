#!/usr/bin/env python3
"""
TikTok Trend Hunter — Fetch hot topics for daily content generation.

Sources (no API keys needed):
  1. Google Trends RSS (daily trending searches)
  2. Rotating TikTok content categories
  3. Seasonal / holiday keywords auto-detected

Output: trending keywords file → consumed by auto_content.py
"""

import json
import random
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

ROOT = Path(__file__).resolve().parents[1]
CACHE_FILE = ROOT / "data" / "trending_keywords.json"
HISTORY_FILE = ROOT / "data" / "used_keywords.jsonl"
TTL_SECONDS = 86400  # 24 hours

# ── TikTok content categories (always relevant, rotated) ──
TIKTOK_CATEGORIES = {
    "dance": [
        "viral dance challenge 2026",
        "TikTok dance tutorial",
        "learn TikTok dance step by step",
        "trending TikTok dance moves",
        "TikTok dance compilation download",
    ],
    "cooking": [
        "TikTok viral recipe",
        "TikTok cooking hack",
        "easy TikTok food trend",
        "TikTok meal prep ideas",
        "TikTok dessert recipe viral",
    ],
    "comedy": [
        "funny TikTok compilation",
        "TikTok comedy skit",
        "viral TikTok funny video",
        "TikTok prank compilation",
        "best TikTok memes",
    ],
    "beauty": [
        "TikTok makeup tutorial",
        "TikTok skincare routine",
        "viral beauty hack TikTok",
        "TikTok hair tutorial trending",
        "GRWM TikTok makeup",
    ],
    "fitness": [
        "TikTok workout challenge",
        "TikTok fitness routine",
        "TikTok yoga tutorial",
        "home workout TikTok trend",
        "TikTok weight loss journey",
    ],
    "diy": [
        "TikTok DIY craft",
        "TikTok room makeover",
        "TikTok home decor hack",
        "TikTok life hack viral",
        "TikTok organization tips",
    ],
    "tech": [
        "TikTok tech review",
        "TikTok gadget unboxing",
        "TikTok phone tips",
        "TikTok editing tutorial",
        "CapCut tutorial TikTok",
    ],
    "music": [
        "TikTok viral song",
        "TikTok music trend",
        "TikTok song download",
        "trending TikTok audio",
        "TikTok sound viral",
    ],
    "pet": [
        "TikTok cute cat video",
        "TikTok dog tricks",
        "viral pet video TikTok",
        "TikTok funny animal compilation",
        "TikTok pet challenge",
    ],
    "travel": [
        "TikTok travel vlog",
        "TikTok hidden gem destination",
        "TikTok travel hack",
        "TikTok budget travel tips",
        "TikTok beautiful places",
    ],
    "fashion": [
        "TikTok outfit ideas",
        "TikTok fashion trend 2026",
        "OOTD TikTok style",
        "TikTok thrift haul",
        "TikTok street style",
    ],
    "education": [
        "TikTok learning hack",
        "TikTok study tips",
        "TikTok language learning",
        "TikTok history facts",
        "TikTok science experiment",
    ],
}

# ── Seasonal boosters (auto-detected by month) ──
SEASONAL = {
    1: ["New Year TikTok trend", "TikTok resolution challenge", "winter TikTok vibe"],
    2: ["Valentine TikTok idea", "TikTok love story", "TikTok couple challenge"],
    3: ["spring TikTok aesthetic", "TikTok spring cleaning", "March TikTok trend"],
    4: ["Easter TikTok idea", "spring break TikTok", "TikTok April trend"],
    5: ["Mother Day TikTok", "TikTok summer prep", "May TikTok challenge"],
    6: ["summer TikTok trend", "TikTok travel summer", "TikTok summer outfit"],
    7: ["TikTok summer challenge", "TikTok beach day", "July TikTok viral"],
    8: ["back to school TikTok", "TikTok school supplies", "August TikTok trend"],
    9: ["fall TikTok aesthetic", "TikTok autumn vibe", "September TikTok"],
    10: ["Halloween TikTok costume", "TikTok spooky season", "October TikTok trend"],
    11: ["Thanksgiving TikTok", "Black Friday TikTok haul", "November TikTok"],
    12: ["Christmas TikTok idea", "TikTok holiday gift guide", "TikTok winter trend"],
}


def fetch_google_trends() -> list[str]:
    """Fetch trending searches from Google Trends RSS (free, no key needed)."""
    try:
        import urllib.request
        import xml.etree.ElementTree as ET

        url = "https://trends.google.com/trending/rss?geo=US"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            tree = ET.parse(resp)

        keywords = []
        for item in tree.findall(".//item/title"):
            text = item.text or ""
            # Only keep terms that could relate to TikTok content
            if len(text) > 3 and len(text) < 60:
                keywords.append(f"TikTok {text.lower()} trend")
        return keywords[:10]  # Top 10
    except Exception:
        return []


def get_seasonal_keywords() -> list[str]:
    """Get seasonal keywords based on current month."""
    month = datetime.now().month
    return SEASONAL.get(month, [])


def get_rotation_keywords(count: int = 5) -> list[str]:
    """Pick random categories and return keywords from each."""
    cats = random.sample(list(TIKTOK_CATEGORIES.keys()), min(count, len(TIKTOK_CATEGORIES)))
    keywords = []
    for cat in cats:
        keywords.append(random.choice(TIKTOK_CATEGORIES[cat]))
    return keywords


def load_history() -> set[str]:
    """Load previously used keywords to avoid repetition."""
    used = set()
    if HISTORY_FILE.exists():
        with open(HISTORY_FILE) as f:
            for line in f:
                try:
                    used.add(json.loads(line).get("keyword", ""))
                except Exception:
                    pass
    return used


def save_to_history(keywords: list[str]) -> None:
    """Save used keywords to history."""
    HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
    now = datetime.now().isoformat()
    with open(HISTORY_FILE, "a") as f:
        for kw in keywords:
            f.write(json.dumps({"keyword": kw, "date": now}) + "\n")


def deduplicate(keywords: list[str], history: set[str]) -> list[str]:
    """Remove previously used keywords."""
    return [kw for kw in keywords if kw not in history]


def main(output_format: str = "text"):
    """Main: collect trending keywords, deduplicate, output."""
    print(f"🔍 TikTok Trend Hunter — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print()

    keywords: list[str] = []

    # 1. Google Trends (real-time hot topics)
    print("📡 Fetching Google Trends...")
    trends = fetch_google_trends()
    print(f"   Found {len(trends)} trending topics")
    keywords.extend(trends)

    # 2. Category rotation (always relevant)
    rotation = get_rotation_keywords(3)
    print(f"🎯 Category rotation: {len(rotation)} keywords")
    keywords.extend(rotation)

    # 3. Seasonal boost
    seasonal = get_seasonal_keywords()
    if seasonal:
        print(f"🗓️  Seasonal keywords: {len(seasonal)}")
        keywords.extend(seasonal)

    # 4. Deduplicate against history
    history = load_history()
    fresh = deduplicate(keywords, history)
    print(f"\n✅ {len(fresh)} fresh keywords (removed {len(keywords) - len(fresh)} duplicates)")

    if not fresh:
        # Fallback: pick random from all categories
        print("⚠️  No fresh keywords, using category fallback...")
        fresh = get_rotation_keywords(5)

    # Save to history
    save_to_history(fresh)

    # Output
    if output_format == "json":
        result = {
            "date": datetime.now().isoformat(),
            "keywords": fresh,
        }
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(result, f, indent=2)
        print(f"📁 Saved to {CACHE_FILE}")
    else:
        for kw in fresh:
            print(kw)

    print(f"\n🟢 Ready — {len(fresh)} keywords for today's content")


if __name__ == "__main__":
    fmt = sys.argv[1] if len(sys.argv) > 1 else "text"
    main(output_format=fmt)
