#!/usr/bin/env python3
"""
批量多语言落地页生成器 — Saveik i18n Pipeline
=============================================
使用 LLM API (OpenAI 兼容) 批量翻译 en.json → 20 个语种。
同时自动更新 i18n.ts、dictionaries.ts、middleware.ts 配置。

用法:
  python3 scripts/generate_i18n.py --api-key sk-xxx
  python3 scripts/generate_i18n.py --api-key sk-xxx --model gpt-4o
  python3 scripts/generate_i18n.py --api-key sk-xxx --langs ja,ko,fr  # 只生成指定语种

环境变量:
  OPENAI_API_KEY  — API Key (优先级低于 --api-key)
  OPENAI_BASE_URL — API Base URL (默认 https://api.openai.com/v1)
"""

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

# ============================================================
# 20 语种配置 — 按 TikTok 用户规模 + 全球覆盖精选
# ============================================================
# fmt: off
LANGUAGES = [
    # code      native_name          english_name      html_lang   og_locale    accept_lang_matches
    ("en",      "English",          "English",         "en",       "en_US",     ["en"]),
    ("id",      "Bahasa Indonesia", "Indonesian",      "id",       "id_ID",     ["id"]),
    ("vi",      "Tiếng Việt",       "Vietnamese",      "vi",       "vi_VN",     ["vi"]),
    ("th",      "ไทย",              "Thai",            "th",       "th_TH",     ["th"]),
    ("es",      "Español",          "Spanish",         "es-419",   "es_419",    ["es-419","es-mx","es-ar","es-cl","es-co","es-pe","es"]),
    ("pt-br",   "Português",        "Portuguese (BR)", "pt-BR",    "pt_BR",     ["pt-br","pt_br","pt"]),
    ("zh",      "简体中文",          "Chinese (Simp)",  "zh-Hans",  "zh_CN",     ["zh-cn","zh-hans","zh"]),
    ("ja",      "日本語",            "Japanese",        "ja",       "ja_JP",     ["ja"]),
    ("ko",      "한국어",            "Korean",          "ko",       "ko_KR",     ["ko"]),
    ("ar",      "العربية",          "Arabic",          "ar",       "ar_SA",     ["ar"]),
    ("hi",      "हिन्दी",           "Hindi",           "hi",       "hi_IN",     ["hi"]),
    ("fr",      "Français",         "French",          "fr",       "fr_FR",     ["fr"]),
    ("de",      "Deutsch",          "German",          "de",       "de_DE",     ["de"]),
    ("ru",      "Русский",          "Russian",         "ru",       "ru_RU",     ["ru"]),
    ("tr",      "Türkçe",           "Turkish",         "tr",       "tr_TR",     ["tr"]),
    ("it",      "Italiano",         "Italian",         "it",       "it_IT",     ["it"]),
    ("pl",      "Polski",           "Polish",          "pl",       "pl_PL",     ["pl"]),
    ("nl",      "Nederlands",       "Dutch",           "nl",       "nl_NL",     ["nl"]),
    ("ms",      "Bahasa Melayu",    "Malay",           "ms",       "ms_MY",     ["ms"]),
    ("fil",     "Filipino",         "Filipino",        "fil",      "fil_PH",    ["fil","tl"]),
]
# fmt: on


def load_source(project_root: Path) -> dict:
    """Load en.json as translation source."""
    path = project_root / "dictionaries" / "en.json"
    with open(path) as f:
        return json.load(f)


def get_api_client(args):
    """Initialize OpenAI-compatible client."""
    try:
        from openai import OpenAI
    except ImportError:
        print("❌ 需要安装 openai 库: pip3 install openai")
        sys.exit(1)

    api_key = args.api_key or os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("❌ 需要提供 API Key: --api-key 或 OPENAI_API_KEY 环境变量")
        sys.exit(1)

    base_url = args.api_base or os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")

    return OpenAI(api_key=api_key, base_url=base_url), args.model


def build_prompt(source: dict, lang_native: str, lang_english: str) -> str:
    """Build translation prompt for LLM."""
    source_json = json.dumps(source, ensure_ascii=False, indent=2)

    return f"""You are a professional localization expert. Translate the following JSON dictionary from English to {lang_english} ({lang_native}).

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no explanations.
2. Preserve ALL keys exactly as-is. Only translate the string VALUES.
3. Keep all URLs, HTML tags, and placeholders (like {{year}}) unchanged.
4. For "meta.keywords": translate each comma-separated keyword into {lang_english}, keep commas.
5. For "meta.title": keep "Saveik — " prefix, translate the rest. Append " | Saveik" at the end.
6. For "meta.description": fully translate, keep brand name "Saveik" unchanged.
7. For "hero.titleHighlight": make it punchy and marketing-friendly in {lang_english}.
8. For "features.items[]": translate title and desc for each item naturally.
9. For "faq.questions[]": translate both q (question) and a (answer) naturally.
10. For "ui.*": translate all UI strings naturally — these are interface labels.
11. For "howTo.steps[]": translate title and desc naturally.
12. For "download.*": translate button labels naturally (e.g. "Download MP4" → localized equivalent).
13. Keep product name "Saveik" and "TikTok" untranslated.
14. Keep "MP4", "MP3", "HD", "1080p", "4K" as-is.
15. For languages with formal/informal registers ({lang_english}): use neutral/professional tone.

Source JSON to translate:
```json
{source_json}
```

Return ONLY the translated JSON:"""


def validate_structure(original: dict, translated: dict) -> list[str]:
    """Validate translated JSON matches source structure. Returns list of errors."""
    errors = []

    def check_keys(orig: Any, trans: Any, path: str = ""):
        if type(orig) != type(trans):
            errors.append(f"{path}: type mismatch — expected {type(orig).__name__}, got {type(trans).__name__}")
            return
        if isinstance(orig, dict):
            for k in orig:
                if k not in trans:
                    errors.append(f"{path}.{k}: missing key")
                else:
                    check_keys(orig[k], trans[k], f"{path}.{k}")
            for k in trans:
                if k not in orig:
                    errors.append(f"{path}.{k}: extra key (will be ignored)")
        elif isinstance(orig, list):
            if len(orig) != len(trans):
                errors.append(f"{path}: array length mismatch — expected {len(orig)}, got {len(trans)}")

    check_keys(original, translated)
    return errors


def translate_language(
    client,
    model: str,
    source: dict,
    code: str,
    native: str,
    english: str,
    max_retries: int = 3,
) -> dict | None:
    """Translate source dictionary to target language via LLM."""
    prompt = build_prompt(source, native, english)

    for attempt in range(max_retries):
        try:
            print(f"  🤖 调用 {model} 翻译 {code} ({native})...", end=" ", flush=True)

            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a professional translator. Return ONLY valid JSON, no markdown or explanations.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=16000,
            )

            raw = response.choices[0].message.content.strip()

            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = re.sub(r"^```(?:json)?\s*\n", "", raw)
                raw = re.sub(r"\n```\s*$", "", raw)

            translated = json.loads(raw)

            # Validate
            errors = validate_structure(source, translated)
            if errors:
                print(f"⚠️  结构验证失败 (尝试 {attempt + 1}/{max_retries})")
                for e in errors[:5]:
                    print(f"     - {e}")
                if attempt < max_retries - 1:
                    time.sleep(2)
                    continue
                return None

            # Post-process: ensure meta.title ends with " | Saveik"
            if not translated.get("meta", {}).get("title", "").endswith(" | Saveik"):
                translated["meta"]["title"] = translated["meta"]["title"].rstrip(" |") + " | Saveik"

            token_usage = response.usage.total_tokens if response.usage else 0
            print(f"✅ ({token_usage} tokens)")
            return translated

        except json.JSONDecodeError as e:
            print(f"❌ JSON 解析失败 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2)
        except Exception as e:
            print(f"❌ API 错误 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                time.sleep(3)

    return None


def quote_key(k: str) -> str:
    """Quote key if it contains non-identifier characters (like hyphens)."""
    if re.match(r"^[a-zA-Z_$][a-zA-Z0-9_$]*$", k):
        return k
    return f'"{k}"'


def save_dictionary(project_root: Path, code: str, data: dict):
    """Save translated dictionary JSON."""
    path = project_root / "dictionaries" / f"{code}.json"
    with open(path, "w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def generate_i18n_ts(project_root: Path, codes: list[str], langs: list[tuple]):
    """Generate updated lib/i18n.ts with all languages."""
    # Build locale array
    locale_list = ", ".join(f'"{c}"' for c in codes)

    # Build localeLabels
    labels = ",\n  ".join(f'{quote_key(c)}: "{native}"' for c, native, _, _, _, _ in langs)
    natives = ",\n  ".join(f'{quote_key(c)}: "{native}"' for c, native, _, _, _, _ in langs)
    html_langs = ",\n  ".join(f'{quote_key(c)}: "{hl}"' for c, _, _, hl, _, _ in langs)
    og_locales = ",\n  ".join(f'{quote_key(c)}: "{og}"' for c, _, _, _, og, _ in langs)

    # Build detectLocale function with all accept-language matches
    detect_blocks = []
    for c, native, english, hl, og, matches in langs:
        if c == "en":
            continue
        conditions = " || ".join(f'lang.includes("{m}")' for m in matches)
        detect_blocks.append(f'  // {english} ({native})\n  if ({conditions}) return "{c}"')

    detect_body = "\n\n".join(detect_blocks)

    content = f'''/**
 * i18n Configuration — 20-language dictionary-based localization
 *
 * URL strategy: / → EN (default), /id → Indonesian, /zh → Chinese, etc.
 * Auto-generated by scripts/generate_i18n.py — DO NOT EDIT MANUALLY
 */

export const locales = [{locale_list}] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

/** Locale display names (used in language switcher) */
export const localeLabels: Record<Locale, string> = {{
  {labels},
}}

/** Locale native names for the switcher */
export const localeNative: Record<Locale, string> = {{
  {natives},
}}

/** HTML lang attribute values */
export const localeHtmlLang: Record<Locale, string> = {{
  {html_langs},
}}

/** OpenGraph locale values */
export const localeOgLocale: Record<Locale, string> = {{
  {og_locales},
}}

/**
 * Detect locale from Accept-Language header
 */
export function detectLocale(acceptLanguage: string | null): Locale {{
  if (!acceptLanguage) return defaultLocale

  const lang = acceptLanguage.toLowerCase()

{detect_body}

  return defaultLocale
}}

/**
 * Get locale from URL pathname
 */
export function getLocaleFromPath(pathname: string): {{
  locale: Locale
  cleanPath: string
}} {{
  const segments = pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && locales.includes(firstSegment as Locale)) {{
    return {{
      locale: firstSegment as Locale,
      cleanPath: "/" + segments.slice(1).join("/") || "/",
    }}
  }}

  return {{ locale: defaultLocale, cleanPath: pathname }}
}}

/**
 * Build URL with locale prefix
 */
export function localizedPath(path: string, locale: Locale): string {{
  const clean = path === "/" ? "" : path.replace(/\\/$/, "")
  if (locale === defaultLocale) return clean || "/"
  return `/${{locale}}${{clean}}`
}}
'''

    path = project_root / "lib" / "i18n.ts"
    with open(path, "w") as f:
        f.write(content)
    print(f"  ✅ lib/i18n.ts — {len(codes)} 个语种")


def generate_dictionaries_ts(project_root: Path, codes: list[str]):
    """Generate updated lib/dictionaries.ts with all 20 language loaders."""
    loader_entries = []
    for c in codes:
        loader_entries.append(f'  {quote_key(c)}: () => import("@/dictionaries/{c}.json").then((m) => m.default),')

    loaders = "\n".join(loader_entries)

    content = f'''/**
 * Dictionary Loader — loads translation JSON and provides typed access
 * Auto-generated by scripts/generate_i18n.py — DO NOT EDIT MANUALLY
 */
import type {{ Locale }} from "./i18n"

const dictionaryLoaders: Record<Locale, () => Promise<Record<string, unknown>>> = {{
{loaders}
}}

/** Type representing the nested dictionary structure */
export type Dictionary = {{
  meta: {{
    title: string
    description: string
    keywords: string
  }}
  hero: {{
    badge: string
    title: string
    titleHighlight: string
    subtitle: string
    placeholder: string
    cta: string
    trust: string
  }}
  download: {{
    title: string
    mp4: string
    mp3: string
    hd: string
    copyLink: string
    pasteAgain: string
    loading: string
    error: string
    noVideo: string
  }}
  features: {{
    title: string
    subtitle: string
    items: Array<{{ title: string; desc: string }}>
  }}
  stats: {{
    videos: string
    users: string
    countries: string
  }}
  howTo: {{
    title: string
    subtitle: string
    steps: Array<{{ title: string; desc: string }}>
  }}
  faq: {{
    title: string
    subtitle: string
    questions: Array<{{ q: string; a: string }}>
  }}
  footer: {{
    copyright: string
    links: {{
      faq: string
      privacy: string
      terms: string
      feedback: string
      help: string
    }}
  }}
  ui: {{
    privacyFirst: string
    noRegistration: string
    allDevices: string
    discover: string
    processing: string
    processingVideo: string
    photoMode: string
    photos: string
    downloadVerb: string
    downloadAnother: string
    builtDifferent: string
    builtDifferentSub: string
    threeSteps: string
    thatsIt: string
    noComplexity: string
    everyScreen: string
    sameExperience: string
    iphoneAndroid: string
    downloadMobile: string
    windowsMacLinux: string
    downloadDesktop: string
    freeForever: string
    downloadsToday: string
    languages: string
    youAsk: string
    weAnswer: string
    readyToDownload: string
    ctaSubtitle: string
    startDownloading: string
    footerPitch: string
    legal: string
    support: string
    terms: string
    privacy: string
    disclaimer: string
    forPersonalUse: string
    stepMobile1: string
    stepMobile2: string
    stepMobile3: string
    stepMobile4: string
    stepMobile5: string
    stepDesktop1: string
    stepDesktop2: string
    stepDesktop3: string
    stepDesktop4: string
    stepDesktop5: string
  }}
  language: string
}}

const cache = new Map<Locale, Dictionary>()

export async function getDictionary(locale: Locale): Promise<Dictionary> {{
  const cached = cache.get(locale)
  if (cached) return cached

  const loader = dictionaryLoaders[locale]
  if (!loader) {{
    const fallback = await dictionaryLoaders.en()
    cache.set(locale, fallback as Dictionary)
    return fallback as Dictionary
  }}

  const dict = (await loader()) as Dictionary
  cache.set(locale, dict)
  return dict
}}

export function getCachedDict(locale: Locale): Dictionary | undefined {{
  return cache.get(locale)
}}
'''

    path = project_root / "lib" / "dictionaries.ts"
    with open(path, "w") as f:
        f.write(content)
    print(f"  ✅ lib/dictionaries.ts — {len(codes)} 个 loader")


def main():
    parser = argparse.ArgumentParser(
        description="批量多语言落地页生成器 — 使用 LLM 翻译 en.json → 20 语种",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--api-key", help="OpenAI API Key (或设置 OPENAI_API_KEY)")
    parser.add_argument("--api-base", help="API Base URL (或设置 OPENAI_BASE_URL)")
    parser.add_argument("--model", default="gpt-4o-mini", help="模型名称 (默认: gpt-4o-mini)")
    parser.add_argument("--langs", help="只生成指定语种，逗号分隔 (如: ja,ko,fr)")
    parser.add_argument("--dry-run", action="store_true", help="仅生成配置，不调 API 翻译")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parent.parent
    source = load_source(project_root)

    # Filter languages
    if args.langs:
        target_codes = set(args.langs.split(","))
        filtered = [l for l in LANGUAGES if l[0] in target_codes]
        if not filtered:
            print(f"❌ 未找到指定语种: {args.langs}")
            sys.exit(1)
    else:
        filtered = list(LANGUAGES)

    codes = [l[0] for l in filtered]
    print(f"\n{'='*60}")
    print(f"🌍 Saveik i18n 批量翻译流水线")
    print(f"{'='*60}")
    print(f"📋 目标语种: {len(filtered)} 个 ({', '.join(codes)})")
    print(f"🤖 模型: {args.model}")
    print(f"📁 项目: {project_root}")
    print()

    if args.dry_run:
        print("🔍 DRY RUN — 仅生成配置文件，不调用 API\n")
    else:
        client, model = get_api_client(args)
        print(f"🔑 API: {client.base_url}\n")

    # Phase 1: Translate dictionaries
    translated = {}
    existing = set()
    for code in codes:
        dict_path = project_root / "dictionaries" / f"{code}.json"
        if code == "en":
            translated["en"] = source
            print(f"  ⏭️  en (English) — 源文件，跳过")
            continue
        if dict_path.exists() and code not in (args.langs or "").split(","):
            print(f"  ⏭️  {code} — 已存在，跳过 (用 --langs {code} 强制覆盖)")
            existing.add(code)
            continue

        if args.dry_run:
            print(f"  🔍 {code} — DRY RUN，跳过翻译")
            continue

        lang_info = next(l for l in filtered if l[0] == code)
        result = translate_language(client, model, source, code, lang_info[1], lang_info[2])
        if result:
            save_dictionary(project_root, code, result)
            translated[code] = result
        else:
            print(f"  ❌ {code} 翻译失败，跳过")
        time.sleep(1)  # Rate limit buffer

    # Phase 2: Generate config files
    print(f"\n📝 生成配置文件...")
    generate_i18n_ts(project_root, codes, filtered)
    generate_dictionaries_ts(project_root, codes)

    # Summary
    print(f"\n{'='*60}")
    print(f"📊 完成摘要")
    print(f"{'='*60}")
    new_count = len(translated) - 1  # exclude en
    print(f"✅ 本次翻译: {new_count} 个语种")
    print(f"⏭️  已有文件: {len(existing)} 个")
    print(f"📁 总计语种: {len(codes)} 个")
    print(f"🗂️  字典目录: {project_root / 'dictionaries'}")
    print(f"\n下一步:")
    print(f"  1. pip3 install openai")
    print(f"  2. 检查翻译质量: cat dictionaries/zh.json | python3 -m json.tool")
    print(f"  3. 本地测试: npm run dev")
    print(f"  4. 构建部署: npx vercel --prod")
    print()


if __name__ == "__main__":
    main()
