#!/usr/bin/env python3
"""
一键部署 Faster-Whisper GPU 节点到 RunPod。
不需要 Docker，不需要手配环境。

用法:
  1. 去 https://runpod.io/console/user/api 拿 API Key
  2. export RUNPOD_API_KEY=你的key
  3. python3 scripts/deploy/auto_deploy.py

脚本自动完成:
  ✓ 找到最便宜的空闲 GPU (RTX 3090/4090)
  ✓ 创建 GPU Pod
  ✓ 自动安装 Python + Faster-Whisper + FastAPI
  ✓ 启动转录服务
  ✓ 输出端点 URL
  ✓ 自动更新 .env.local
"""

import os
import sys
import time
import json
import subprocess
import urllib.request
import urllib.error

API_KEY = os.getenv("RUNPOD_API_KEY")
if not API_KEY:
    print("❌ 请先设置 RUNPOD_API_KEY: export RUNPOD_API_KEY=你的key")
    print("   获取 key: https://runpod.io/console/user/api")
    sys.exit(1)

ENDPOINT = "https://api.runpod.io/graphql?api_key=" + API_KEY


def gql(query: str, variables: dict = None) -> dict:
    """Execute a GraphQL query against RunPod API."""
    payload = json.dumps({"query": query, "variables": variables or {}}).encode()
    req = urllib.request.Request(
        ENDPOINT, data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            if "errors" in data:
                raise Exception(data["errors"][0]["message"])
            return data["data"]
    except urllib.error.HTTPError as e:
        raise Exception(f"API error {e.code}: {e.read().decode()}")


def find_cheapest_gpu() -> dict:
    """Find the cheapest available GPU with ≥16GB VRAM."""
    print("🔍 查找最便宜的空闲 GPU...")

    result = gql("""
        query GpuTypes {
            gpuTypes {
                id
                displayName
                memoryInGb
                securePrice
                communityPrice
                lowestPrice(input: { onlyCompatible: true }) {
                    minimumBidPrice
                    uninterruptablePrice
                }
            }
        }
    """)

    gpus = result.get("gpuTypes", [])
    # Filter: ≥16GB VRAM, available for spot/community
    candidates = []
    for g in gpus:
        mem = g.get("memoryInGb", 0)
        if mem < 16:
            continue
        price = g.get("lowestPrice", {})
        spot = price.get("minimumBidPrice") or price.get("uninterruptablePrice") or g.get("communityPrice") or g.get("securePrice")
        if spot and spot > 0:
            candidates.append({
                "id": g["id"],
                "name": g["displayName"],
                "vram": mem,
                "price": spot,
            })

    candidates.sort(key=lambda x: x["price"])
    for i, g in enumerate(candidates[:5]):
        tag = " ← 推荐" if i == 0 else ""
        print(f"  {i+1}. {g['name']} ({g['vram']}GB) - ${g['price']:.2f}/hr{tag}")

    if not candidates:
        raise Exception("没找到可用 GPU，稍后再试")
    return candidates[0]


def create_pod(gpu: dict) -> dict:
    """Create a GPU pod with auto-setup script."""
    gpu_id = gpu["id"]
    price = gpu["price"]

    # Startup script: install everything and start server
    setup_script = r"""#!/bin/bash
set -e
echo "[whisper-setup] Installing dependencies..."
apt-get update -qq && apt-get install -y -qq python3-pip ffmpeg > /dev/null 2>&1
pip3 install -q faster-whisper fastapi uvicorn python-multipart

echo "[whisper-setup] Starting Whisper server..."
cat > /whisper_server.py << 'PYEOF'
import os, time, tempfile
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL = None

def load_model():
    global MODEL
    if MODEL: return MODEL
    from faster_whisper import WhisperModel
    print("[whisper] Loading large-v3...")
    MODEL = WhisperModel("large-v3", device="cuda", compute_type="float16")
    print("[whisper] Ready.")
    return MODEL

@app.on_event("startup")
async def startup(): load_model()

@app.get("/health")
async def health(): return {"status": "ok", "model": "large-v3", "device": "cuda"}

@app.post("/v1/audio/transcriptions")
async def transcribe(file: UploadFile = File(...), language: str = Form(None)):
    t0 = time.time()
    suffix = os.path.splitext(file.filename or "audio.mp3")[1] or ".mp3"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        model = load_model()
        segments, info = model.transcribe(tmp_path, language=language or None, beam_size=5, vad_filter=True)
        full_text = " ".join(s.text for s in segments)
        elapsed = time.time() - t0
        print(f"[whisper] {info.duration:.0f}s audio → {elapsed:.1f}s ({info.duration/elapsed:.1f}x)")
        return {"text": full_text.strip(), "language": info.language, "duration": info.duration}
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
PYEOF

python3 /whisper_server.py
"""

    print(f"\n🚀 创建 GPU Pod ({gpu['name']}, ${price:.2f}/hr)...")
    print("   首次启动会下载模型 (~3GB)，约需 2-3 分钟...")

    result = gql("""
        mutation StartPod($input: PodFindAndDeployOnDemandInput!) {
            podFindAndDeployOnDemand(input: $input) {
                id
                name
                imageName
                machineId
                machine {
                    podHostId
                }
                desiredStatus
                runtime {
                    ports { ip port isIpPublic }
                }
                costPerHr
            }
        }
    """, {
        "input": {
            "cloudType": "COMMUNITY",
            "gpuCount": 1,
            "volumeInGb": 50,
            "containerDiskInGb": 20,
            "minVcpuCount": 4,
            "minMemoryInGb": 16,
            "gpuTypeId": gpu_id,
            "name": "whisper-large-v3",
            "imageName": "runpod/pytorch:2.2.0-py3.10-cuda12.1.1-devel-ubuntu22.04",
            "dockerArgs": "",
            "ports": "8000/http",
            "volumeMountPath": "/workspace",
            "env": [],
            "startSsh": True,
        }
    })

    pod = result["podFindAndDeployOnDemand"]
    pod_id = pod["id"]
    print(f"   Pod ID: {pod_id}")
    return pod


def wait_for_pod(pod_id: str, timeout: int = 300) -> dict:
    """Wait for pod to be ready and return connection info."""
    print("\n⏳ 等待 Pod 启动...")

    for i in range(timeout // 5):
        time.sleep(5)
        result = gql("""
            query GetPod($id: String!) {
                pod(input: { podId: $id }) {
                    id
                    desiredStatus
                    runtime {
                        uptimeInSeconds
                        ports { ip port isIpPublic }
                    }
                    machine { podHostId }
                }
            }
        """, {"id": pod_id})

        pod = result.get("pod", {})
        status = pod.get("desiredStatus", "")
        ports = pod.get("runtime", {}).get("ports", [])
        public_port = next((p for p in ports if p.get("isIpPublic")), None)

        if status == "RUNNING" and public_port:
            ip = public_port["ip"]
            port = public_port["port"]
            print(f"\n✅ Pod 就绪! {ip}:{port}")
            return {"ip": ip, "port": port, "pod_id": pod_id}
        elif status == "ERROR":
            raise Exception("Pod 启动失败")

        print(f"   状态: {status} ({i * 5}s)...")

    raise Exception(f"Pod 启动超时 ({timeout}s)")


def setup_and_start(pod_id: str, ip: str, port: str):
    """Execute setup + start script on the pod via SSH or API."""
    print(f"\n📦 安装 Faster-Whisper 并启动服务...")

    # We'll use RunPod's exec API to run the setup
    # First, kill any existing process on port 8000
    # Then run the setup

    setup_cmd = """#!/bin/bash
apt-get update -qq && apt-get install -y -qq ffmpeg > /dev/null 2>&1
pip3 install -q faster-whisper fastapi uvicorn python-multipart > /dev/null 2>&1

cat > /tmp/whisper_server.py << 'EOF'
import os, time, tempfile
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL = None
def load_model():
    global MODEL
    if MODEL: return MODEL
    from faster_whisper import WhisperModel
    MODEL = WhisperModel("large-v3", device="cuda", compute_type="float16")
    return MODEL

@app.on_event("startup")
async def startup(): load_model()

@app.get("/health")
async def health(): return {"status": "ok", "model": "large-v3"}

@app.post("/v1/audio/transcriptions")
async def transcribe(file: UploadFile = File(...), language: str = Form(None)):
    t0 = time.time()
    suffix = os.path.splitext(file.filename or "audio.mp3")[1] or ".mp3"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    try:
        model = load_model()
        segments, info = model.transcribe(tmp_path, language=language or None, beam_size=5, vad_filter=True)
        text = " ".join(s.text for s in segments)
        print(f"Done: {info.duration:.0f}s in {time.time()-t0:.1f}s")
        return {"text": text.strip(), "language": info.language, "duration": info.duration}
    finally:
        os.unlink(tmp_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

pkill -f uvicorn 2>/dev/null; sleep 1
nohup python3 /tmp/whisper_server.py > /tmp/whisper.log 2>&1 &
echo "Server starting on port 8000"
"""

    print("   正在 Pod 上执行安装脚本...")
    result = gql("""
        mutation ExecPod($input: PodExecInput!) {
            podExec(input: $input) {
                output
            }
        }
    """, {
        "input": {
            "podId": pod_id,
            "command": setup_cmd,
        }
    })

    output = result.get("podExec", {}).get("output", "")
    print(f"   {output[:200]}")


def update_env(ip: str, port: str):
    """Update .env.local with the new Whisper endpoint."""
    env_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        ".env.local"
    )

    url = f"http://{ip}:{port}"

    if os.path.exists(env_path):
        with open(env_path) as f:
            content = f.read()

        # Replace or add WHISPER_BASE_URL
        if "WHISPER_BASE_URL=" in content:
            import re
            content = re.sub(r'WHISPER_BASE_URL=.*', f'WHISPER_BASE_URL={url}', content)
        else:
            content += f"\nWHISPER_BASE_URL={url}\n"

        # Ensure WHISPER_API_KEY is set
        if "WHISPER_API_KEY=" not in content:
            content += "WHISPER_API_KEY=self-hosted\n"
        elif "WHISPER_API_KEY=" in content and not content.split("WHISPER_API_KEY=")[1].strip().startswith("self-hosted"):
            import re
            content = re.sub(r'WHISPER_API_KEY=.*', 'WHISPER_API_KEY=self-hosted', content)

        with open(env_path, "w") as f:
            f.write(content)

    print(f"\n📝 已更新 .env.local: WHISPER_BASE_URL={url}")


def main():
    print("=" * 60)
    print("  RePurposeFast — Faster-Whisper 一键部署")
    print("=" * 60)

    try:
        # 1. Find cheapest GPU
        gpu = find_cheapest_gpu()

        # 2. Create pod
        pod = create_pod(gpu)

        # 3. Wait for pod
        info = wait_for_pod(pod["id"])

        # 4. Setup and start server
        setup_and_start(pod["id"], info["ip"], info["port"])

        # 5. Wait for server to be ready
        print("\n⏳ 等待 Whisper 模型加载 (约60秒)...")
        for i in range(15):
            time.sleep(4)
            try:
                req = urllib.request.Request(f"http://{info['ip']}:{info['port']}/health")
                with urllib.request.urlopen(req, timeout=5) as resp:
                    if resp.status == 200:
                        print(f"\n✅ Whisper 服务器就绪!")
                        break
            except:
                pass
            print(f"   .", end="", flush=True)

        # 6. Update env
        update_env(info["ip"], info["port"])

        print("\n" + "=" * 60)
        print("  🎉 部署完成!")
        print(f"  Whisper 端点: http://{info['ip']}:{info['port']}")
        print(f"  Pod ID:       {info['pod_id']}")
        print(f"  成本:         ${gpu['price']:.2f}/hr")
        print(f"  测试:         curl http://{info['ip']}:{info['port']}/health")
        print("=" * 60)
        print("\n⚠️  用完后记得删除 Pod，避免持续计费:")
        print(f"   https://runpod.io/console/pods")
        print(f"   或运行: python3 scripts/deploy/delete_pod.py {info['pod_id']}")

        return info

    except Exception as e:
        print(f"\n❌ 部署失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
