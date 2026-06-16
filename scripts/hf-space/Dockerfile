FROM nvidia/cuda:12.1.0-cudnn8-runtime-ubuntu22.04

# Install Python and system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch with CUDA support
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt
COPY app.py .

# Start FastAPI on HF Space port
CMD ["uvicorn", "app:api", "--host", "0.0.0.0", "--port", "7860"]
