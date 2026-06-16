#!/usr/bin/env python3
"""批量翻译 — 直接用 DeepSeek API，不依赖其他模块"""
import json, os, sys, time, urllib.request, ssl

ssl._create_default_https_context = ssl._create_unverified_context

API_KEY = "sk-c69119220bf34737a100dbc7c2a379a1"
BASE = "https://api.deepseek.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DICT = os.path.join(ROOT, "dictionaries")

LOCALES = {
  "ja": ("Japanese", "日本語", "🇯🇵"),
  "ko": ("Korean", "한국어", "🇰🇷"),
  "es": ("Spanish", "Español", "🇪🇸"),
  "fr": ("French", "Français", "🇫🇷"),
  "de": ("German", "Deutsch", "🇩🇪"),
  "pt": ("Portuguese", "Português", "🇧🇷"),
  "ar": ("Arabic", "العربية", "🇸🇦"),
  "hi": ("Hindi", "हिन्दी", "🇮🇳"),
  "id": ("Indonesian", "Bahasa Indonesia", "🇮🇩"),
  "th": ("Thai", "ไทย", "🇹🇭"),
  "vi": ("Vietnamese", "Tiếng Việt", "🇻🇳"),
  "ru": ("Russian", "Русский", "🇷🇺"),
  "it": ("Italian", "Italiano", "🇮🇹"),
}


def translate(texts: dict, lang_name: str, native: str) -> dict:
    source = json.dumps(texts, ensure_ascii=False)
    prompt = f"""Translate these UI strings from English to {lang_name} ({native}).
Return ONLY a valid JSON object with the same keys. Translate values, keep keys.
Brand name "ailomo" stays untranslated. Tech terms (API, AI, SRT, CSV, SEO) stay English.
Keep HTML tags, placeholders, URLs unchanged.

Source JSON:
{source}

{lang_name} JSON:"""

    data = json.dumps({
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "You are a professional translator. Output ONLY valid JSON, no markdown."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.1,
        "max_tokens": 8000,
    }).encode()

    req = urllib.request.Request(
        f"{BASE}/chat/completions",
        data=data,
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"},
    )

    resp = urllib.request.urlopen(req, timeout=120)
    result = json.loads(resp.read())
    content = result["choices"][0]["message"]["content"].strip()

    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
    content = content.strip()

    try:
        return json.loads(content)
    except:
        print(f"  Parse failed, raw: {content[:200]}")
        return None


def main():
    en_path = os.path.join(DICT, "en.json")
    if not os.path.exists(en_path):
        print("en.json not found")
        return

    en = json.load(open(en_path))

    target = sys.argv[1] if len(sys.argv) > 1 else None
    if target and target in LOCALES:
        to_do = {target: LOCALES[target]}
    else:
        to_do = LOCALES
        print(f"Translate all {len(to_do)} languages? (or pass lang code: python3 scripts/translate_all.py ja)")

    done = 0
    for code, (name, native, flag) in to_do.items():
        out_path = os.path.join(DICT, f"{code}.json")
        if os.path.exists(out_path) and not target:
            print(f"  {flag} {name} — already exists, skip")
            continue

        print(f"  {flag} {name} ({native}) ...", end=" ", flush=True)
        try:
            translated = translate(en, name, native)
            if translated:
                json.dump(translated, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
                size = os.path.getsize(out_path)
                print(f"✅ {size}B")
                done += 1
            else:
                print("❌ failed")
        except Exception as e:
            print(f"❌ {e}")
        time.sleep(1)

    print(f"\nDone: {done} languages translated")


if __name__ == "__main__":
    main()
