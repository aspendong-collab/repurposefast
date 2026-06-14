#!/usr/bin/env python3
"""
Saveik SEO Maintenance Pipeline
================================
Daily/weekly automated tasks to maintain freshness and quality.

用法:
  python3 scripts/maintenance.py daily     # 每日检查
  python3 scripts/maintenance.py weekly    # 每周更新
  python3 scripts/maintenance.py monthly   # 每月深度维护
  python3 scripts/maintenance.py content   # 内容保鲜（更新日期+小改）
  python3 scripts/maintenance.py health    # 健康检查
  python3 scripts/maintenance.py monitor   # 排名监控（需GSC API）
"""

import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
import subprocess

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BLOG_DIR = PROJECT_ROOT / "content" / "blog"
STALE_DAYS = 90  # 超过90天未更新的文章需要刷新

# ============================================================
# 📋 每日任务
# ============================================================
def daily_check():
    """每日快速检查：核心页面可达性 + 索引状态"""
    print("=" * 50)
    print(f"📋 Daily Check — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)

    urls = [
        ("Homepage", "https://www.saveik.com"),
        ("ID", "https://www.saveik.com/id"),
        ("VI", "https://www.saveik.com/vi"),
        ("TH", "https://www.saveik.com/th"),
        ("Blog", "https://www.saveik.com/blog"),
        ("Sitemap", "https://www.saveik.com/sitemap.xml"),
        ("Robots", "https://www.saveik.com/robots.txt"),
    ]

    issues = []
    for name, url in urls:
        try:
            r = subprocess.run(
                ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", url],
                capture_output=True, text=True, timeout=10
            )
            code = r.stdout.strip()
            status = "✅" if code in ("200", "307") else "❌"
            if code not in ("200", "307"):
                issues.append(f"{name}: HTTP {code}")
            print(f"  {status} {name}: {code}")
        except Exception as e:
            issues.append(f"{name}: {e}")
            print(f"  ❌ {name}: ERROR")

    if issues:
        print(f"\n⚠️  {len(issues)} issues found:")
        for i in issues:
            print(f"  - {i}")
    else:
        print(f"\n✅ All systems normal")

    return issues

# ============================================================
# 📅 每周任务
# ============================================================
def weekly_update():
    """每周更新：内容新鲜度检查 + 待办提醒"""
    print("=" * 50)
    print(f"📅 Weekly Check — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 50)

    # 1. Check content freshness
    print("\n📝 Content Freshness:")
    now = datetime.now(timezone.utc)
    stale_posts = []

    for lang_dir in sorted(BLOG_DIR.iterdir()):
        if not lang_dir.is_dir() or lang_dir.name.startswith("_"):
            continue
        for f in sorted(lang_dir.glob("*.json")):
            try:
                with open(f) as fh:
                    post = json.load(fh)
                date_str = post.get("dateModified") or post.get("datePublished", "")
                if date_str:
                    post_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    days_old = (now - post_date).days
                    if days_old > STALE_DAYS:
                        stale_posts.append((f.relative_to(BLOG_DIR), days_old))
            except:
                pass

    if stale_posts:
        print(f"  ⚠️  {len(stale_posts)} posts > {STALE_DAYS} days old — needs refresh:")
        for path, days in sorted(stale_posts, key=lambda x: x[1], reverse=True)[:10]:
            print(f"    - {path} ({days}d)")
    else:
        print(f"  ✅ All posts within {STALE_DAYS} day freshness window")

    # 2. Check for last build time
    print("\n🔧 System:")
    build_cache = PROJECT_ROOT / ".next"
    if build_cache.exists():
        mtime = datetime.fromtimestamp(build_cache.stat().st_mtime)
        days_since = (datetime.now() - mtime).days
        if days_since > 7:
            print(f"  ⚠️  Last build: {days_since} days ago — rebuild recommended")
        else:
            print(f"  ✅ Last build: {days_since}d ago")

    # 3. Weekly to-do reminders
    print("\n📌 Weekly Actions:")
    print("  □ Post 2-3 Quora answers with Saveik link")
    print("  □ Share 1 social media post (Twitter/LinkedIn)")
    print("  □ Check GSC for new keywords appearing")
    print("  □ Review competitors for new content ideas")

    return stale_posts

# ============================================================
# 🗓️ 每月任务
# ============================================================
def monthly_deep_maintenance():
    """每月深度维护：内容更新 + 新文章 + 外链"""
    print("=" * 50)
    print(f"🗓️  Monthly Deep Maintenance — {datetime.now().strftime('%Y-%m')}")
    print("=" * 50)

    print("\n📝 Content Update Checklist:")
    print("  □ Pick 3 oldest blog posts → update datePublished to today")
    print("  □ Pick 1 post → expand from 500 words to 1500+ words")
    print("  □ Generate 3 new blog posts via: python3 scripts/auto_content.py --all --count 1")
    print("  □ Update TRENDING_KEYWORDS in auto_content.py with current TikTok trends")

    print("\n🔗 Backlink Actions:")
    print("  □ Submit to 1 new directory (SaaSHub, GetApp, Capterra)")
    print("  □ Write 1 guest post for tech/tools blog")
    print("  □ List on 1 'alternative to' site (AlternativeTo new competitor)")

    print("\n📊 Analytics:")
    print("  □ Review GSC: new queries, CTR, avg position")
    print("  □ Check Bing Webmaster: indexed pages, crawl errors")
    print("  □ Review GA: traffic sources, top pages, bounce rate")

    print("\n🔧 Technical:")
    print("  □ npm update (check for Next.js/React updates)")
    print("  □ Test all 20 locale pages load correctly")
    print("  □ Verify hreflang + schema still valid (Google Rich Results Test)")

# ============================================================
# ✏️ 内容保鲜
# ============================================================
def refresh_content():
    """Refresh stale blog posts by updating dateModified to today"""
    print("=" * 50)
    print("✏️  Content Refresh")
    print("=" * 50)

    now = datetime.now(timezone.utc)
    today_str = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    refreshed = 0

    for lang_dir in sorted(BLOG_DIR.iterdir()):
        if not lang_dir.is_dir() or lang_dir.name.startswith("_"):
            continue
        for f in sorted(lang_dir.glob("*.json")):
            try:
                with open(f) as fh:
                    post = json.load(fh)
                date_str = post.get("dateModified") or post.get("datePublished", "")
                if date_str:
                    post_date = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                    days_old = (now - post_date).days
                    if days_old > STALE_DAYS:
                        post["dateModified"] = today_str
                        with open(f, "w") as fh:
                            json.dump(post, fh, ensure_ascii=False, indent=2)
                            fh.write("\n")
                        refreshed += 1
                        print(f"  ✅ Refreshed: {f.relative_to(BLOG_DIR)} ({days_old}d → 0d)")
            except Exception as e:
                print(f"  ❌ Error: {f.name}: {e}")

    print(f"\n🔄 Refreshed {refreshed} posts")
    if refreshed > 0:
        print("📌 Next step: rebuild + deploy to update sitemap dates")

    return refreshed

# ============================================================
# 🏥 健康检查
# ============================================================
def health_check():
    """Full SEO health check"""
    print("=" * 50)
    print(f"🏥 SEO Health Check")
    print("=" * 50)

    issues = daily_check()
    stale = weekly_update()

    # Blog post count
    post_count = 0
    lang_counts = {}
    for lang_dir in BLOG_DIR.iterdir():
        if lang_dir.is_dir() and not lang_dir.name.startswith("_"):
            posts = list(lang_dir.glob("*.json"))
            post_count += len(posts)
            lang_counts[lang_dir.name] = len(posts)

    print(f"\n📊 Content Stats:")
    print(f"  Total posts: {post_count}")
    print(f"  Languages: {len(lang_counts)}")
    print(f"  Posts/language: min={min(lang_counts.values())}, max={max(lang_counts.values())}, avg={post_count//len(lang_counts)}")

    # Score
    score = 100
    if issues:
        score -= len(issues) * 10
    if stale:
        score -= min(len(stale) * 2, 30)
    if min(lang_counts.values()) < 2:
        score -= 10

    print(f"\n🏆 SEO Health Score: {max(score, 0)}/100")
    if score >= 90:
        print("   Status: Excellent")
    elif score >= 70:
        print("   Status: Good — minor improvements needed")
    elif score >= 50:
        print("   Status: Fair — address issues above")
    else:
        print("   Status: Needs attention — review issues immediately")

    return score

# ============================================================
# 📊 GSC 排名监控
# ============================================================
def monitor_rankings():
    """排名监控提示（需要GSC API接入）"""
    print("=" * 50)
    print("📊 Ranking Monitor")
    print("=" * 50)

    print("\n⚠️  Full GSC integration requires API setup.")
    print("Manual check: https://search.google.com/search-console")
    print()
    print("Key metrics to track weekly:")
    print("  □ Total clicks (target: +20% MoM)")
    print("  □ Total impressions (target: growing)")
    print("  □ Avg CTR (target: >3% for position 1-3)")
    print("  □ Avg position (target: <10)")
    print()
    print("Top queries to watch:")
    print("  □ 'TikTok downloader' (EN, high competition)")
    print("  □ 'download TikTok tanpa watermark' (ID, medium competition)")
    print("  □ 'tải TikTok không logo' (VI, medium competition)")
    print("  □ 'ดาวน์โหลด TikTok ฟรี' (TH, low competition)")
    print("  □ 'descargar TikTok sin marca de agua' (ES, medium competition)")
    print("  □ 'baixar TikTok sem marca d'água' (PT-BR, medium competition)")

# ============================================================
# Main
# ============================================================
def main():
    if len(sys.argv) < 2:
        print("用法: python3 scripts/maintenance.py [daily|weekly|monthly|content|health|monitor]")
        sys.exit(1)

    cmd = sys.argv[1]

    if cmd == "daily":
        daily_check()
    elif cmd == "weekly":
        weekly_update()
    elif cmd == "monthly":
        monthly_deep_maintenance()
    elif cmd == "content":
        refresh_content()
    elif cmd == "health":
        health_check()
    elif cmd == "monitor":
        monitor_rankings()
    else:
        print(f"Unknown command: {cmd}")
        print("Options: daily, weekly, monthly, content, health, monitor")

if __name__ == "__main__":
    main()
