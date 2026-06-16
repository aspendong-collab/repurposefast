FROM pytorch/pytorch:2.2.0-cuda12.1-cudnn8-runtime

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .

# Start FastAPI on HF Space port
CMD ["uvicorn", "app:api", "--host", "0.0.0.0", "--port", "7860"]
