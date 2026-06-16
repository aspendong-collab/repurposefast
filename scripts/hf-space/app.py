"""HF Space: ailomo-whisper — Gradio SDK, auto GPU."""
import os, tempfile, logging
import gradio as gr
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── FastAPI (mounted inside Gradio) ──
api = FastAPI(title="ailomo-whisper")
api.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

_model = None

def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        logger.info("Loading Faster-Whisper large-v3 on GPU...")
        _model = WhisperModel("large-v3", device="cuda", compute_type="float16")
        logger.info("Model loaded")
    return _model

class TranscribeRequest(BaseModel):
    url: str
    language: str | None = None

def download_audio(url: str) -> str:
    tmpdir = tempfile.mkdtemp()
    outtmpl = os.path.join(tmpdir, "%(id)s.%(ext)s")
    ydl_opts = {"format": "bestaudio[ext=m4a]/bestaudio/best", "outtmpl": outtmpl, "quiet": True, "max_filesize": 50 * 1024 * 1024}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        path = os.path.join(tmpdir, f"{info['id']}.m4a")
    if not os.path.exists(path):
        alt = os.path.join(tmpdir, f"{info['id']}.webm")
        return alt if os.path.exists(alt) else (_ for _ in ()).throw(FileNotFoundError("Download failed"))
    return path

@api.post("/transcribe")
def transcribe(req: TranscribeRequest):
    try:
        audio_path = download_audio(req.url)
        model = get_model()
        segments, info = model.transcribe(audio_path, language=req.language, beam_size=5, vad_filter=True)
        seg_list = list(segments)
        text = " ".join(s.text.strip() for s in seg_list)
        os.remove(audio_path)
        os.rmdir(os.path.dirname(audio_path))
        return {"text": text, "language": info.language or "en", "duration": info.duration, "segments": [{"start": int(s.start), "end": int(s.end), "text": s.text.strip()} for s in seg_list]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/health")
def health():
    return {"status": "ok", "model": "large-v3"}

# ── Gradio UI ──
def gradio_transcribe(url, lang):
    import requests
    try:
        r = requests.post("http://localhost:7860/transcribe", json={"url": url, "language": lang or None}, timeout=120)
        d = r.json()
        return d["text"], d["language"], d["duration"]
    except Exception as e:
        return f"Error: {e}", "", 0

demo = gr.Interface(
    fn=gradio_transcribe,
    inputs=[gr.Textbox(label="YouTube URL", placeholder="https://www.youtube.com/watch?v=..."), gr.Textbox(label="Language (optional)", value="en")],
    outputs=[gr.Textbox(label="Transcript", lines=15), gr.Textbox(label="Language"), gr.Number(label="Duration (sec)")],
    title="ailomo-whisper",
    description="Free YouTube transcription via Faster-Whisper large-v3 on T4 GPU. Enter a YouTube URL to test.",
)

app = gr.mount_gradio_app(demo, api, path="/")
