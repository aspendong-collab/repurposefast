#!/usr/bin/env python3
"""批量翻译 — standalone, no external deps"""
import json, os, sys, time, urllib.request, ssl
ssl._create_default_https_context = ssl._create_unverified_context

DICT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dictionaries")

LOCALES = {
    'nl': ('Dutch','Nederlands','🇳🇱'), 'pl': ('Polish','Polski','🇵🇱'), 'tr': ('Turkish','Türkçe','🇹🇷'),
    'ms': ('Malay','Bahasa Melayu','🇲🇾'), 'fil': ('Filipino','Filipino','🇵🇭'), 'bn': ('Bengali','বাংলা','🇧🇩'),
    'ur': ('Urdu','اردو','🇵🇰'), 'sw': ('Swahili','Kiswahili','🇹🇿'), 'ta': ('Tamil','தமிழ்','🇮🇳'),
    'te': ('Telugu','తెలుగు','🇮🇳'), 'mr': ('Marathi','मराठी','🇮🇳'), 'gu': ('Gujarati','ગુજરાતી','🇮🇳'),
    'pa': ('Punjabi','ਪੰਜਾਬੀ','🇮🇳'), 'fa': ('Persian','فارسی','🇮🇷'), 'he': ('Hebrew','עברית','🇮🇱'),
    'el': ('Greek','Ελληνικά','🇬🇷'), 'cs': ('Czech','Čeština','🇨🇿'), 'sk': ('Slovak','Slovenčina','🇸🇰'),
    'hu': ('Hungarian','Magyar','🇭🇺'), 'ro': ('Romanian','Română','🇷🇴'), 'bg': ('Bulgarian','Български','🇧🇬'),
    'sr': ('Serbian','Српски','🇷🇸'), 'hr': ('Croatian','Hrvatski','🇭🇷'), 'uk': ('Ukrainian','Українська','🇺🇦'),
    'sv': ('Swedish','Svenska','🇸🇪'), 'da': ('Danish','Dansk','🇩🇰'), 'no': ('Norwegian','Norsk','🇳🇴'),
    'fi': ('Finnish','Suomi','🇫🇮'), 'et': ('Estonian','Eesti','🇪🇪'), 'lv': ('Latvian','Latviešu','🇱🇻'),
    'lt': ('Lithuanian','Lietuvių','🇱🇹'), 'sl': ('Slovenian','Slovenščina','🇸🇮'), 'is': ('Icelandic','Íslenska','🇮🇸'),
    'ga': ('Irish','Gaeilge','🇮🇪'), 'mt': ('Maltese','Malti','🇲🇹'), 'cy': ('Welsh','Cymraeg','🏴󠁧󠁢󠁷󠁬󠁳󠁿'),
    'eu': ('Basque','Euskara','🇪🇸'), 'ca': ('Catalan','Català','🇪🇸'), 'gl': ('Galician','Galego','🇪🇸'),
    'af': ('Afrikaans','Afrikaans','🇿🇦'), 'zu': ('Zulu','isiZulu','🇿🇦'), 'xh': ('Xhosa','isiXhosa','🇿🇦'),
    'am': ('Amharic','አማርኛ','🇪🇹'), 'ha': ('Hausa','Hausa','🇳🇬'), 'ig': ('Igbo','Igbo','🇳🇬'),
    'yo': ('Yoruba','Yorùbá','🇳🇬'), 'so': ('Somali','Soomaali','🇸🇴'), 'km': ('Khmer','ភាសាខ្មែរ','🇰🇭'),
}

API_KEY = "sk-c69119220bf34737a100dbc7c2a379a1"
BASE = "https://api.deepseek.com"


def translate(texts, lang_name, native):
    src = json.dumps(texts, ensure_ascii=False)
    prompt = f"""Translate these UI strings from English to {lang_name} ({native}). Return ONLY valid JSON, same keys.
Brand name "ailomo" stays untranslated. Tech terms (API,AI,SRT,CSV,SEO,SSE,HTML,YouTube,Twitter,LinkedIn,Xiaohongshu,Notion,Stripe,Markdown,PDF) stay English. Keep placeholders, emails, URLs unchanged.
{src}"""

    data = json.dumps({"model":"deepseek-chat","messages":[{"role":"system","content":"Output ONLY valid JSON."},{"role":"user","content":prompt}],"temperature":0.1,"max_tokens":8000}).encode()
    req = urllib.request.Request(f"{BASE}/chat/completions", data=data, headers={"Content-Type":"application/json","Authorization":f"Bearer {API_KEY}"})
    resp = urllib.request.urlopen(req, timeout=120)
    content = json.loads(resp.read())["choices"][0]["message"]["content"].strip()
    for t in ["```json","```"]: content = content.replace(t,"")
    return json.loads(content.strip())


def main():
    en = json.load(open(os.path.join(DICT_DIR, "en.json")))
    existing = {f.replace(".json","") for f in os.listdir(DICT_DIR) if f.endswith(".json")}
    todo = [(c, *d) for c, d in LOCALES.items() if c not in existing]

    if not todo: print(f"All {len(existing)} done!"); return

    print(f"🌐 {len(todo)} languages\n")
    ok = 0
    for i, (code, name, native, flag) in enumerate(todo):
        print(f"[{i+1}/{len(todo)}] {flag} {name} ({native}) ...", end=" ", flush=True)
        try:
            out = translate(en, name, native)
            json.dump(out, open(os.path.join(DICT_DIR, f"{code}.json"),"w",encoding="utf-8"), ensure_ascii=False, indent=2)
            print("✅")
            ok += 1
        except Exception as e:
            print(f"❌ {str(e)[:80]}")
        time.sleep(0.9)
    print(f"\n✅ {ok}/{len(todo)} done. Total: {len(existing)+ok} languages.")

if __name__ == "__main__":
    main()
