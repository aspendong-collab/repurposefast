#!/usr/bin/env python3
"""
SEO Ranking Monitor — Saveik.com
=================================
Daily keyword ranking tracker for 20 core keywords across priority locales.

Usage:
  python3 scripts/rank_monitor.py                    # Check all keywords
  python3 scripts/rank_monitor.py --lang en          # English only
  python3 scripts/rank_monitor.py --top 5             # Top 5 keywords only
  python3 scripts/rank_monitor.py --report           # Show 7-day trend
  python3 scripts/rank_monitor.py --setup-gsc [key]  # Set GSC API key

Data stored in: data/rankings_history.csv
"""

import csv
import json
import os
import ssl
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Prefer requests if available, fall back to urllib
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# ============================================================
# 20 Core Keywords to Track
# ============================================================

CORE_KEYWORDS = {
    "en": [
        "tiktok video downloader no watermark",
        "free tiktok downloader",
        "download tiktok videos without watermark",
        "save tiktok videos offline",
        "tiktok to mp4 converter",
    ],
    "id": [
        "download tiktok tanpa watermark",
        "cara download video tiktok",
        "pengunduh tiktok gratis",
        "unduh video tiktok hd",
        "save tiktok tanpa logo",
    ],
    "vi": [
        "tải video tiktok không logo",
        "tải tiktok không watermark",
        "cách tải video tiktok miễn phí",
        "trình tải tiktok hd",
        "download tiktok không watermark",
    ],
    "th": [
        "ดาวน์โหลดวิดีโอ tiktok ไม่มีลายน้ำ",
        "ดาวน์โหลด tiktok ฟรี",
        "โปรแกรมโหลด tiktok",
        "บันทึกวิดีโอ tiktok",
        "โหลด tiktok hd",
    ],
}

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)
HISTORY_FILE = DATA_DIR / "rankings_history.csv"
SITE_URL = "www.saveik.com"


def check_rank_in_html(html: str, keyword: str) -> int | None:
    """Parse Google SERP HTML to find saveik.com rank.

    Returns position (1-based) or None if not found.
    """
    # Naive approach: count organic results before ours
    import re

    # Find all organic result URLs
    results = re.findall(
        r'<a[^>]*href="(https?://[^"]*)"[^>]*>',
        html,
        re.IGNORECASE,
    )

    for i, url in enumerate(results, 1):
        if SITE_URL in url or "saveik.com" in url:
            return i

    return None


def search_keyword(keyword: str, locale: str = "en") -> dict[str, Any]:
    """Search keyword and find saveik.com ranking.

    Uses requests (with SSL verification) or urllib fallback.
    Google may show a CAPTCHA for automated queries — this is expected.
    """
    import urllib.parse

    query = urllib.parse.quote(keyword)
    url = f"https://www.google.com/search?q={query}&hl={locale}&num=20&gl={locale}"

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/131.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": f"{locale},en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    try:
        if HAS_REQUESTS:
            resp = requests.get(url, headers=headers, timeout=15, verify=True)
            html = resp.text
        else:
            import urllib.request
            ctx = ssl.create_default_context()
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
                html = resp.read().decode("utf-8", errors="replace")

        rank = check_rank_in_html(html, keyword)
        return {
            "keyword": keyword,
            "locale": locale,
            "rank": rank,
            "status": "ranked" if rank else "not_found",
            "position": rank,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        error_msg = str(e)[:120]
        # Common Google blocks
        if "429" in error_msg or "rate" in error_msg.lower():
            error_msg = "rate_limited_by_google"
        elif "certificate" in error_msg.lower() or "ssl" in error_msg.lower():
            error_msg = f"ssl_error: {error_msg}"
        return {
            "keyword": keyword,
            "locale": locale,
            "rank": None,
            "status": f"error: {error_msg}",
            "position": None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


def load_history() -> list[dict]:
    """Load ranking history from CSV."""
    if not HISTORY_FILE.exists():
        return []

    with open(HISTORY_FILE) as f:
        reader = csv.DictReader(f)
        return list(reader)


def save_entry(entry: dict) -> None:
    """Append a ranking entry to CSV history."""
    file_exists = HISTORY_FILE.exists()

    with open(HISTORY_FILE, "a", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["timestamp", "locale", "keyword", "rank", "position", "status"],
        )
        if not file_exists:
            writer.writeheader()

        writer.writerow({
            "timestamp": entry["timestamp"],
            "locale": entry["locale"],
            "keyword": entry["keyword"],
            "rank": entry.get("rank", ""),
            "position": entry.get("position", ""),
            "status": entry.get("status", ""),
        })


def check_all(locale_filter: str | None = None, top_n: int | None = None):
    """Check all keywords and save results."""
    total = 0
    found = 0

    for locale, keywords in CORE_KEYWORDS.items():
        if locale_filter and locale != locale_filter:
            continue

        print(f"\n📍 {locale.upper()} — {len(keywords)} keywords")

        for i, kw in enumerate(keywords[:top_n], 1):
            print(f"  [{i}/{min(len(keywords), top_n or 99)}] {kw[:60]:.<60} ", end="", flush=True)

            result = search_keyword(kw, locale)
            save_entry(result)
            total += 1

            if result["rank"]:
                found += 1
                print(f" #{result['rank']:>3}")
            else:
                print(" —")

            time.sleep(2)  # Rate limit

    print(f"\n{'='*60}")
    print(f"Total: {total} | Found: {found} | Not ranked: {total - found}")

    if found == 0:
        print("\n📌 Google Sandbox detected — new domains need 2-6 months to rank.")
        print("   Keep building backlinks and adding fresh content.")
    elif found / total < 0.3:
        print("\n📌 Early ranking stage — some traction, keep going.")
    else:
        print(f"\n📌 Good coverage — {found}/{total} keywords ranked.")

    return total, found


def show_report() -> None:
    """Show 7-day ranking trend."""
    history = load_history()
    if not history:
        print("No history data yet. Run 'check' first.")
        return

    from collections import defaultdict

    # Group by keyword+locale
    by_keyword = defaultdict(list)
    for entry in history:
        key = f"{entry['locale']}:{entry['keyword']}"
        by_keyword[key].append(entry)

    print(f"\n📊 Ranking Report — {len(by_keyword)} keywords tracked")
    print("=" * 70)
    print(f"{'Keyword':<45} {'Latest':>7} {'7d Ago':>7} {'Change':>8}")
    print("-" * 70)

    improved = 0
    declined = 0

    for key, entries in sorted(by_keyword.items()):
        entries.sort(key=lambda e: e["timestamp"])
        latest = entries[-1]
        earliest = entries[0]

        latest_rank = int(latest["position"]) if latest.get("position") else None
        earliest_rank = int(earliest["position"]) if earliest.get("position") else None

        short_key = key.split(":", 1)[1][:42]

        if latest_rank and earliest_rank:
            change = earliest_rank - latest_rank
            change_str = f"+{change}" if change > 0 else str(change) if change < 0 else "—"
            if change > 0:
                improved += 1
            elif change < 0:
                declined += 1

            print(f"{short_key:<45} {'#'+str(latest_rank):>7} {'#'+str(earliest_rank):>7} {change_str:>8}")
        elif latest_rank:
            print(f"{short_key:<45} {'#'+str(latest_rank):>7} {'—':>7} {'NEW':>8}")
        else:
            print(f"{short_key:<45} {'—':>7} {'—':>7} {'—':>8}")

    print("-" * 70)
    print(f"Improved: {improved} | Declined: {declined} | New: {len(by_keyword) - improved - declined}")


# ============================================================
# CLI
# ============================================================

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Saveik SEO Ranking Monitor")
    parser.add_argument("action", nargs="?", default="check",
                        choices=["check", "report"],
                        help="Action: check rankings or show report")
    parser.add_argument("--lang", help="Filter by locale (en, id, vi, th)")
    parser.add_argument("--top", type=int, help="Check only top N keywords per locale")
    parser.add_argument("--report", action="store_true",
                        help="Show 7-day trend report")

    args = parser.parse_args()

    if args.action == "report" or args.report:
        show_report()
    else:
        check_all(locale_filter=args.lang, top_n=args.top)
