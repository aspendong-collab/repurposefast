"""
Faster-Whisper Server — Deploy to RunPod / Vast.ai / any GPU instance.

Usage:
  pip install faster-whisper fastapi uvicorn
  python whisper_server.py

  First run downloads the model (~3GB), then listens on port 8000.

API:
  POST /v1/audio/transcriptions
    - multipart form: file=@audio.mp3
    - optional: language=zh, response_format=verbose_json
    Returns: { "text": "...", "segments": [...], "language": "zh", "duration": 120.5 }

  GET /health → { "status": "ok", "model": "large-v3", "device": "cuda" }

Model selection:
  Set WHISPER_MODEL env var: tiny | base | small | medium | large-v2 | large-v3
  Default: large-v3 (best accuracy)
  For cost savings: medium (2x faster, ~95% accuracy of large)
"""

import os
import time
import tempfile
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Faster-Whisper Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model Loading ────────────────────────────────────────────────────────────

MODEL = None
MODEL_NAME = os.getenv("WHISPER_MODEL", "large-v3")
DEVICE = "cuda"
COMPUTE_TYPE = os.getenv("COMPUTE_TYPE", "float16")  # float16 for GPU, int8 for CPU

def load_model():
    global MODEL
    if MODEL is not None:
        return MODEL

    print(f"[whisper-server] Loading {MODEL_NAME} on {DEVICE} ({COMPUTE_TYPE})...")
    from faster_whisper import WhisperModel

    MODEL = WhisperModel(
        MODEL_NAME,
        device=DEVICE,
        compute_type=COMPUTE_TYPE,
        cpu_threads=4,
        num_workers=2,
    )
    print(f"[whisper-server] Model loaded successfully.")
    return MODEL


@app.on_event("startup")
async def startup():
    load_model()


# ── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": MODEL_NAME,
        "device": DEVICE,
    }


# ── Transcription ─────────────────────────────────────────────────────────────

@app.post("/v1/audio/transcriptions")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(None),
    response_format: str = Form("verbose_json"),
):
    t0 = time.time()

    # Save uploaded file to temp
    suffix = os.path.splitext(file.filename or "audio.mp3")[1] or ".mp3"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        model = load_model()

        # Transcribe
        segments_out = []
        full_text = ""
        detected_lang = None

        segments_gen, info = model.transcribe(
            tmp_path,
            language=language or None,
            beam_size=5,
            word_timestamps=True,
            vad_filter=True,            # Filter silence
            vad_parameters=dict(
                min_silence_duration_ms=500,
            ),
        )

        detected_lang = info.language
        duration = info.duration

        for segment in segments_gen:
            segments_out.append({
                "id": segment.id,
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
                "words": [
                    {"word": w.word, "start": round(w.start, 2), "end": round(w.end, 2)}
                    for w in (segment.words or [])
                ] if hasattr(segment, 'words') else [],
            })
            full_text += segment.text

        elapsed = time.time() - t0
        realtime_factor = duration / elapsed if elapsed > 0 else 0

        print(f"[whisper-server] Done: {duration:.0f}s audio in {elapsed:.1f}s "
              f"({realtime_factor:.1f}x realtime) | lang={detected_lang}")

        return {
            "text": full_text.strip(),
            "segments": segments_out,
            "language": detected_lang,
            "duration": round(duration, 1),
        }

    except Exception as e:
        print(f"[whisper-server] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
