#!/bin/bash
# P4 Content Matrix Expansion — Quick Start
# ==========================================
# Run this script to expand blog content across all 20 languages.

export DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY_HERE"

cd /Users/aspendong/ssstik-clone/FusionTik

echo "📝 Phase 1: Add 1 post per language (20 new posts)"
python3 scripts/auto_content.py --all --count 1

echo ""
echo "📝 Phase 2: Add 2 more posts for priority markets (id, vi, th, es, pt-br)"
python3 scripts/auto_content.py --lang id --count 2
python3 scripts/auto_content.py --lang vi --count 2
python3 scripts/auto_content.py --lang th --count 2
python3 scripts/auto_content.py --lang es --count 2
python3 scripts/auto_content.py --lang pt-br --count 2

echo ""
echo "📝 Phase 3: Rebuild blog index"
python3 scripts/gen_blog_index.py

echo ""
echo "📝 Phase 4: Build + deploy"
npx next build
npx vercel --prod --yes

echo ""
echo "✅ Content expansion complete!"
echo "Expected: 42 + 20 + 10 = 72 blog posts across 20 languages"
