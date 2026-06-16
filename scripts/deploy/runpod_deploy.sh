#!/bin/bash
# ──────────────────────────────────────────────────────────────────────────────
# Deploy Faster-Whisper Server to RunPod Serverless
#
# Prerequisites:
#   1. Install runpod CLI: pip install runpod
#   2. Set API key:        export RUNPOD_API_KEY=xxx
#   3. Or deploy manually via https://runpod.io/console/serverless
#
# Cost estimate:
#   RTX 4090: ~$0.49/hr → processes ~20hr audio/hr → $0.025/hr of audio
#   A40:      ~$0.39/hr → processes ~15hr audio/hr → $0.026/hr of audio
#   Per minute of audio: ~$0.0004 (400x cheaper than OpenAI Whisper)
# ──────────────────────────────────────────────────────────────────────────────

set -e

echo "=== Deploying Faster-Whisper to RunPod ==="

# ── Step 1: Build Docker image ──
echo ""
echo "Step 1: Building Docker image..."
cd "$(dirname "$0")"
docker build -t repurposefast-whisper:latest .

# ── Step 2: Push to Docker Hub (or use RunPod's direct upload) ──
echo ""
echo "Step 2: In RunPod Console → Serverless → New Endpoint:"
echo ""
echo "  Template:     Custom Container"
echo "  Image:        <your-dockerhub>/repurposefast-whisper:latest"
echo "  GPU Type:     RTX 4090 (best price/perf)"
echo "  Min Workers:  0 (scale to zero when idle)"
echo "  Max Workers:  3"
echo "  Idle Timeout: 60s"
echo "  Port:         8000"
echo ""
echo "=== Manual deployment instructions ==="
echo ""
echo "1. Go to https://runpod.io/console/serverless"
echo "2. Click 'New Endpoint'"
echo "3. Fill in the details above"
echo "4. After deployment, copy the endpoint URL"
echo "5. Add to .env.local:"
echo "   WHISPER_API_KEY=your-runpod-key"
echo "   WHISPER_BASE_URL=https://api.runpod.ai/v2/your-endpoint-id/openai/v1"
echo ""
echo "=== Alternative: Deploy on Vast.ai ==="
echo ""
echo "1. Go to https://vast.ai/console/create"
echo "2. Search for RTX 4090 (~$0.30/hr)"
echo "3. Select 'Edit Image & Config'"
echo "4. Paste this startup script:"
echo ""
echo "   apt update && apt install -y python3-pip ffmpeg && \\"
echo "   pip install faster-whisper fastapi uvicorn python-multipart && \\"
echo "   python3 whisper_server.py"
echo ""
echo "5. Expose port 8000"
echo "6. Use the instance IP in WHISPER_BASE_URL"
echo ""
echo "=== Cost Calculator ==="
echo ""
echo "Free users: 1000 × 120 min = 120,000 min/month"
echo "GPU cost:   120,000 × \$0.0004/min = \$48/month"
echo "vs OpenAI:  120,000 × \$0.006/min   = \$720/month"
echo "Savings:    93.3% (每年省 \$8,000+)"
