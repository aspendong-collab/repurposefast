"""
HuggingFace Space: ailomo-whisper
Free GPU (T4) for Faster-Whisper transcription.
Endpoint: POST /transcribe  { "url": "https://youtube.com/..." }
"""

import os, tempfile, logging
import gradio as gr
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
from faster_whisper import WhisperModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── FastAPI mounted inside Gradio ──
api = FastAPI()

# Lazy-load model
_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("Loading Faster-Whisper large-v3 on GPU...")
        _model = WhisperModel("large-v3", device="cuda", compute_type="float16")
        logger.info("Model loaded!")
    return _model

class TranscribeRequest(BaseModel):
    url: str
    language: str | None = None

def download_audio(url: str) -> str:
    tmpdir = tempfile.mkdtemp()
    outtmpl = os.path.join(tmpdir, "%(id)s.%(ext)s")
    ydl_opts = {
        "format": "bestaudio[ext=m4a]/bestaudio/best",
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
        "max_filesize": 50 * 1024 * 1024,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info["id"]
        path = os.path.join(tmpdir, f"{video_id}.m4a")
    if not os.path.exists(path):
        alt = os.path.join(tmpdir, f"{video_id}.webm")
        if os.path.exists(alt): return alt
        raise FileNotFoundError("Audio download failed")
    return path

@api.post("/transcribe")
def transcribe(req: TranscribeRequest):
    try:
        logger.info(f"Downloading: {req.url[:80]}")
        audio_path = download_audio(req.url)
        file_size = os.path.getsize(audio_path) / (1024*1024)
        logger.info(f"Audio: {file_size:.1f}MB")

        model = get_model()
        segments, info = model.transcribe(audio_path, language=req.language, beam_size=5, vad_filter=True)
        segments_list = list(segments)
        full_text = " ".join(s.text.strip() for s in segments_list)

        # Cleanup
        os.remove(audio_path)
        os.rmdir(os.path.dirname(audio_path))

        logger.info(f"Done: {len(segments_list)} segments, {len(full_text)} chars, lang={info.language}")
        return {
            "text": full_text,
            "language": info.language or "en",
            "duration": info.duration,
            "segments": [{"start": int(s.start), "end": int(s.end), "text": s.text.strip()} for s in segments_list],
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/health")
def health():
    return {"status": "ok", "model": "large-v3", "device": "cuda"}

# ── Gradio UI (simple test page) ──
def gradio_transcribe(url, language):
    import requests
    try:
        resp = requests.post("http://localhost:7860/transcribe", json={"url": url, "language": language or None})
        data = resp.json()
        return data["text"][:2000] + "...", data["language"], data["duration"]
    except Exception as e:
        return f"Error: {e}", "", 0

demo = gr.Interface(
    fn=gradio_transcribe,
    inputs=[gr.Textbox(label="YouTube URL"), gr.Textbox(label="Language (optional)", placeholder="en/zh/ja/auto")],
    outputs=[gr.Textbox(label="Transcript", lines=10), gr.Textbox(label="Language"), gr.Number(label="Duration (s)")],
    title="ailomo-whisper",
    description="Free YouTube transcription via Faster-Whisper large-v3 on GPU",
)

# Mount FastAPI on Gradio
app = gr.mount_gradio_app(demo, api, path="/")
