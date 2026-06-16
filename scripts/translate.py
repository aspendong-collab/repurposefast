#!/usr/bin/env python3
"""
🌐 Auto-Translate Script — 一键翻译所有 63 种语言
用法: python3 scripts/translate.py [--locale=zh] [--all]

流程:
  1. 读取 dictionaries/en.json 作为源文件
  2. 用 DeepSeek/OpenAI API 翻译到目标语言
  3. 输出到 dictionaries/{locale}.json

只需维护 en.json 一个文件，运行此脚本即可同步所有语言。
"""

import json, os, sys, time, urllib.request, ssl

# SSL fix for macOS
ssl._create_default_https_context = ssl._create_unverified_context

API_KEY = os.getenv("OPENAI_API_KEY")
API_BASE = os.getenv("OPENAI_BASE_URL", "https://api.deepseek.com")
MODEL = "deepseek-chat"

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DICT_DIR = os.path.join(ROOT, "dictionaries")
sys.path.insert(0, ROOT)

from lib.i18n import localeMap, locales, defaultLocale

def call_llm(prompt: str) -> str:
    """Call DeepSeek/GPT API for translation."""
    data = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system", "content": "You are a professional translator. Translate the following JSON UI strings accurately. Preserve all JSON structure, keys, and placeholders. Only translate the values. Output ONLY valid JSON, no markdown, no explanation."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
        "max_tokens": 8000,
    }).encode()

    req = urllib.request.Request(
        f"{API_BASE}/chat/completions",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
    )

    resp = urllib.request.urlopen(req, timeout=120)
    result = json.loads(resp.read())
    content = result["choices"][0]["message"]["content"].strip()

    # Strip markdown code blocks if present
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
    if content.endswith("```"):
        content = content.rsplit("\n", 1)[0]

    return content


def translate_dict(source: dict, target_lang: str, lang_name: str, native_name: str) -> dict:
    """Translate entire dictionary to target language."""
    source_str = json.dumps(source, ensure_ascii=False, indent=2)

    prompt = f"""Translate the following JSON UI strings from English to {lang_name} ({native_name}).

IMPORTANT RULES:
1. Translate ONLY the string values, keep ALL JSON keys exactly as-is
2. Preserve all {{placeholders}}, HTML tags, and special characters
3. Keep brand names like "ailomo" untranslated
4. Keep technical terms like "API", "AI", "SRT", "CSV", "SEO" in English
5. Keep URLs and email addresses unchanged
6. Output ONLY the valid translated JSON, no markdown, no explanation
7. For very short strings (like button labels), use the most natural/common translation

Source JSON:
{source_str}

Translated JSON for {lang_name}:"""

    translated_str = call_llm(prompt)

    try:
        return json.loads(translated_str)
    except json.JSONDecodeError:
        # Retry once with stricter prompt
        print(f"  ⚠️ JSON parse error, retrying...")
        time.sleep(2)
        translated_str = call_llm(prompt + "\n\nCRITICAL: Output ONLY valid JSON. No markdown, no comments.")
        try:
            return json.loads(translated_str)
        except json.JSONDecodeError:
            print(f"  ❌ Failed to parse JSON for {lang_name}, saving raw output")
            # Save raw for manual fix
            return {"_error": "translation_failed", "_raw": translated_str}


def load_base() -> dict:
    """Load the English base dictionary."""
    path = os.path.join(DICT_DIR, "en.json")
    if not os.path.exists(path):
        print("❌ dictionaries/en.json not found")
        sys.exit(1)
    with open(path) as f:
        return json.load(f)


def save_dict(locale: str, data: dict):
    """Save translated dictionary."""
    path = os.path.join(DICT_DIR, f"{locale}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅ Saved {locale}.json")


def main():
    if not API_KEY or "sk-xxx" in API_KEY or "你的" in API_KEY:
        print("❌ 请先设置 API Key: export OPENAI_API_KEY=sk-xxx")
        sys.exit(1)

    target_locale = None
    translate_all = False

    for arg in sys.argv:
        if arg.startswith("--locale="):
            target_locale = arg.split("=")[1]
        if arg == "--all":
            translate_all = True

    base = load_base()

    if target_locale:
        to_translate = [target_locale]
    elif translate_all:
        to_translate = [l for l in locales if l != "en"]
    else:
        # Find missing locales
        existing = {f.replace(".json", "") for f in os.listdir(DICT_DIR) if f.endswith(".json")}
        to_translate = [l for l in locales if l != "en" and l not in existing]
        if not to_translate:
            print("✅ All languages already translated!")
            print(f"   Run with --all to force retranslate all.")
            return

    print(f"🌐 Translating {len(to_translate)} languages...")
    print(f"   Source: en.json")
    print(f"   Model: {MODEL}")
    print()

    for i, loc in enumerate(to_translate):
        info = localeMap.get(loc)
        if not info:
            print(f"  ⏭️ {loc}: unknown locale, skipping")
            continue

        print(f"[{i+1}/{len(to_translate)}] {info.flag} {info.name} ({info.nativeName}) ...", end=" ", flush=True)

        try:
            translated = translate_dict(base, info.code, info.name, info.nativeName)
            save_dict(info.code, translated)
        except Exception as e:
            print(f"❌ Failed: {e}")

        if i < len(to_translate) - 1:
            time.sleep(1)  # Rate limit

    print(f"\n✅ Done! Translated {len(to_translate)} languages.")


if __name__ == "__main__":
    main()
