# Faster-Whisper GPU Server
# Deploy to RunPod, Vast.ai, or any NVIDIA GPU instance

FROM nvidia/cuda:12.4.0-runtime-ubuntu22.04

RUN apt-get update && apt-get install -y \
    python3.11 python3-pip ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY whisper_server.py .
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# First run will download the model (~3GB)
ENV WHISPER_MODEL=large-v3
ENV PORT=8000

EXPOSE 8000

CMD ["python3", "whisper_server.py"]
