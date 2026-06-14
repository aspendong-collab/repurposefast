#!/usr/bin/env python3
"""
SEO Rank Tracker
================
Tracks saveik.com Google rankings for 20 core keywords across locales.
Runs daily — pipe output to a log file for trend tracking.

Usage:
  python3 scripts/rank_tracker.py          # single run
  python3 scripts/rank_tracker.py --json   # JSON output
  python3 scripts/rank_tracker.py --cron   # for crontab usage
  python3 scripts/rank_tracker.py --diff   # compare vs last run

Crontab (daily at 8am):
  0 8 * * * cd /path/to/project && python3 scripts/rank_tracker.py --cron >> logs/rank_history.txt
"""

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote_plus

try:
    import requests
except ImportError:
    print("pip3 install requests")
    sys.exit(1)

PROJECT = Path(__file__).resolve().parent.parent
LOG_FILE = PROJECT / "logs" / "rank_history.jsonl"

# ============================================================
# 20 Core Keywords (locale → keyword)
# ============================================================
CORE_KEYWORDS: list[dict[str, Any]] = [
    # ── EN (highest volume) ──
    {"locale": "en", "kw": "TikTok downloader no watermark", "url": "https://www.saveik.com"},
    {"locale": "en", "kw": "download TikTok video without watermark", "url": "https://www.saveik.com"},
    {"locale": "en", "kw": "TikTok to MP4 converter free", "url": "https://www.saveik.com"},
    {"locale": "en", "kw": "save TikTok videos HD no app", "url": "https://www.saveik.com"},
    {"locale": "en", "kw": "TikTok downloader USA", "url": "https://www.saveik.com/en/local/united-states"},
    # ── ID (highest traffic market) ──
    {"locale": "id", "kw": "download TikTok tanpa watermark", "url": "https://www.saveik.com/id"},
    {"locale": "id", "kw": "cara download video TikTok", "url": "https://www.saveik.com/id"},
    {"locale": "id", "kw": "download TikTok Indonesia", "url": "https://www.saveik.com/id/local/indonesia"},
    # ── VI ──
    {"locale": "vi", "kw": "tải video TikTok không logo", "url": "https://www.saveik.com/vi"},
    {"locale": "vi", "kw": "tải TikTok không watermark", "url": "https://www.saveik.com/vi/local/vietnam"},
    # ── TH ──
    {"locale": "th", "kw": "ดาวน์โหลด TikTok ไม่มีลายน้ำ", "url": "https://www.saveik.com/th"},
    {"locale": "th", "kw": "โหลดวิดีโอ TikTok ฟรี", "url": "https://www.saveik.com/th/local/thailand"},
    # ── ES (LatAm + Spain) ──
    {"locale": "es", "kw": "descargar videos TikTok sin marca de agua", "url": "https://www.saveik.com/es"},
    {"locale": "es", "kw": "descargar TikTok México", "url": "https://www.saveik.com/es/local/mexico"},
    # ── PT-BR ──
    {"locale": "pt-br", "kw": "baixar TikTok sem marca d'água", "url": "https://www.saveik.com/pt-br"},
    {"locale": "pt-br", "kw": "baixar vídeos TikTok Brasil", "url": "https://www.saveik.com/pt-br/local/brasil"},
    # ── AR ──
    {"locale": "ar", "kw": "تنزيل TikTok بدون علامة مائية", "url": "https://www.saveik.com/ar"},
    # ── KO / JA ──
    {"locale": "ko", "kw": "틱톡 영상 저장 워터마크 제거", "url": "https://www.saveik.com/ko"},
    {"locale": "ja", "kw": "TikTok 動画 ダウンロード 透かしなし", "url": "https://www.saveik.com/ja"},
    # ── Brand ──
    {"locale": "en", "kw": "saveik", "url": "https://www.saveik.com"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


def search(keyword: str, num: int = 100) -> list[str]:
    """
    Searches Google and returns list of organic result URLs.
    Uses Google Custom Search scraping (lightweight — for personal use only).
    """
    urls: list[str] = []
    query = quote_plus(keyword)
    url = f"https://www.google.com/search?q={query}&num={num}&hl=en"

    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  ⚠️ Google fetch failed: {e}")
        return urls

    # Simple regex to extract href from search result snippets
    import re
    # Match: <a href="/url?q=https://example.com/..." ...
    pattern = re.compile(r'<a[^>]*href="/url\?q=(https?://[^&"]+)[^"]*"')
    matches = pattern.findall(resp.text)

    seen = set()
    for m in matches:
        url_decoded = m.replace("%3A", ":").replace("%2F", "/").replace("%3F", "?").replace("%3D", "=")
        url_decoded = url_decoded.replace("%25", "%")
        if url_decoded not in seen and "google.com" not in url_decoded:
            seen.add(url_decoded)
            urls.append(url_decoded)

    return urls


def find_rank(urls: list[str], target: str) -> int:
    """Return 1-based rank, or 0 if not found."""
    for i, u in enumerate(urls, 1):
        if target in u:
            return i
    return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Saveik SEO Rank Tracker")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--cron", action="store_true", help="Cron mode (append to log)")
    parser.add_argument("--diff", action="store_true", help="Compare with last run")
    args = parser.parse_args()

    timestamp = datetime.now(timezone.utc).isoformat()
    results: list[dict[str, Any]] = []

    print(f"\n{'='*60}")
    print(f"📊 Saveik Rank Tracker — {timestamp[:19]}Z")
    print(f"{'='*60}")
    print(f"{'Keyword':<50} {'Rank':>6}  {'Status'}")
    print(f"{'─'*62}")

    for item in CORE_KEYWORDS:
        kw = item["kw"]
        target = item["url"]
        locale = item["locale"]

        urls = search(kw)
        rank = find_rank(urls, target)
        status = "✅" if rank > 0 else "❌"
        rank_str = f"#{rank}" if rank > 0 else "—"
        print(f"  [{locale}] {kw:<47} {rank_str:>6}  {status}")

        results.append({
            "timestamp": timestamp,
            "locale": locale,
            "keyword": kw,
            "target_url": target,
            "rank": rank,
            "total_results": len(urls),
        })

        time.sleep(2)  # Rate limiting

    # Summary
    ranked = sum(1 for r in results if r["rank"] > 0)
    top10 = sum(1 for r in results if 0 < r["rank"] <= 10)
    top30 = sum(1 for r in results if 0 < r["rank"] <= 30)
    avg_rank = sum(r["rank"] for r in results if r["rank"] > 0)
    avg_rank = avg_rank / ranked if ranked > 0 else 0

    print(f"{'─'*62}")
    print(f"  Ranked: {ranked}/{len(results)}  |  Top 10: {top10}  |  Top 30: {top30}  |  Avg Rank: {avg_rank:.1f}")
    print(f"{'='*60}\n")

    # Save to log
    if args.cron:
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(LOG_FILE, "a") as f:
            for r in results:
                f.write(json.dumps(r, ensure_ascii=False) + "\n")
        print(f"📝 Logged to {LOG_FILE}")

    # JSON output
    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))

    # Diff mode
    if args.diff:
        if not LOG_FILE.exists():
            print("⚠️  No previous data to compare.")
            return

        prev_results: dict[str, int] = {}
        try:
            lines = LOG_FILE.read_text().strip().split("\n")
            for line in lines:
                r = json.loads(line)
                key = f"{r['locale']}|{r['keyword']}"
                prev_results[key] = r["rank"]
        except Exception:
            pass

        print("\n📈 Changes vs Last Run:")
        for r in results:
            key = f"{r['locale']}|{r['keyword']}"
            prev = prev_results.get(key, 0)
            curr = r["rank"]
            if curr == 0 and prev == 0:
                continue
            if curr > 0 and prev == 0:
                print(f"  🆕 {r['keyword'][:40]} → #{curr} (NEW!)")
            elif curr == 0 and prev > 0:
                print(f"  🔻 {r['keyword'][:40]} → DROPPED (was #{prev})")
            elif curr < prev:
                print(f"  📈 {r['keyword'][:40]} : #{prev} → #{curr} (+{prev-curr})")
            elif curr > prev:
                print(f"  📉 {r['keyword'][:40]} : #{prev} → #{curr} (-{curr-prev})")


if __name__ == "__main__":
    main()
