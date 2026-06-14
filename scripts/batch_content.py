#!/usr/bin/env python3
"""Batch run auto_content.py for multiple languages in parallel."""
import subprocess, sys, os

LANGUAGES = ["en","id","vi","th","es","pt-br","zh","ja","ko","ar","hi","fr","de","ru","tr","it","pl","nl","ms","fil"]
KEY = os.environ.get("DEEPSEEK_API_KEY", "sk-95643c2d79da4cb785d941c84bdf3d7d")
COUNT = int(sys.argv[1]) if len(sys.argv) > 1 else 1

procs = []
for lang in LANGUAGES:
    env = {**os.environ, "DEEPSEEK_API_KEY": KEY, "OPENAI_API_KEY": KEY}
    p = subprocess.Popen(
        ["python3", "scripts/auto_content.py", "--lang", lang, "--count", str(COUNT)],
        cwd="/Users/aspendong/ssstik-clone/FusionTik", env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    procs.append((lang, p))
    print(f"  🚀 {lang} started")

results = []
for lang, p in procs:
    out, _ = p.communicate(timeout=300)
    ok = "✅ 已生成" in out.decode() or "✅" in out.decode()
    results.append((lang, ok))
    print(f"  {'✅' if ok else '❌'} {lang}")

print(f"\nDone: {sum(1 for _,ok in results if ok)}/{len(results)} languages")
