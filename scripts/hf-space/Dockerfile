FROM runpod/pytorch:2.4.0-py3.11-cuda12.4.0-devel-ubuntu22.04

WORKDIR /app
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt
COPY app.py .

CMD ["uvicorn", "app:api", "--host", "0.0.0.0", "--port", "7860"]
