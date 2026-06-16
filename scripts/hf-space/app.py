"""HF Space: ailomo-whisper — Gradio + embedded REST API."""
import os, tempfile, logging, requests
import gradio as gr
import yt_dlp

logging.basicConfig(level=logging.INFO)
_model = None

def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        logging.info("Loading Faster-Whisper large-v3...")
        _model = WhisperModel("large-v3", device="cuda", compute_type="float16")
        logging.info("Model ready")
    return _model

def download_audio(url: str) -> str:
    tmpdir = tempfile.mkdtemp()
    outtmpl = os.path.join(tmpdir, "%(id)s.%(ext)s")
    ydl_opts = {"format": "bestaudio[ext=m4a]/bestaudio/best", "outtmpl": outtmpl, "quiet": True, "max_filesize": 50*1024*1024}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        path = os.path.join(tmpdir, f"{info['id']}.m4a")
    if not os.path.exists(path):
        alt = os.path.join(tmpdir, f"{info['id']}.webm")
        if os.path.exists(alt): return alt
        raise FileNotFoundError("Download failed")
    return path

def transcribe_fn(url, lang):
    try:
        audio_path = download_audio(url)
        model = get_model()
        segments, info = model.transcribe(audio_path, language=lang or None, beam_size=5, vad_filter=True)
        seg_list = list(segments)
        text = " ".join(s.text.strip() for s in seg_list)
        os.remove(audio_path)
        os.rmdir(os.path.dirname(audio_path))
        return text, info.language or "en", info.duration
    except Exception as e:
        return f"Error: {e}", "", 0

# ── Gradio UI ──
with gr.Blocks(title="ailomo-whisper") as demo:
    gr.Markdown("# ailomo-whisper\nFree YouTube transcription via Faster-Whisper large-v3 on T4 GPU")
    url = gr.Textbox(label="YouTube URL", placeholder="https://www.youtube.com/watch?v=...")
    lang = gr.Textbox(label="Language (optional)", value="en")
    btn = gr.Button("Transcribe")
    text = gr.Textbox(label="Transcript", lines=15)
    lang_out = gr.Textbox(label="Language")
    dur = gr.Number(label="Duration (sec)")
    btn.click(fn=transcribe_fn, inputs=[url, lang], outputs=[text, lang_out, dur])

# ── REST API via Gradio mount ──
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
api = FastAPI()

class TR(BaseModel):
    url: str
    language: str | None = None

@api.post("/transcribe")
def transcribe(req: TR):
    try:
        audio_path = download_audio(req.url)
        model = get_model()
        segments, info = model.transcribe(audio_path, language=req.language, beam_size=5, vad_filter=True)
        seg_list = list(segments)
        text = " ".join(s.text.strip() for s in seg_list)
        os.remove(audio_path)
        os.rmdir(os.path.dirname(audio_path))
        return {"text": text, "language": info.language or "en", "duration": info.duration}
    except Exception as e:
        raise HTTPException(500, str(e))

@api.get("/health")
def health():
    return {"status": "ok", "model": "large-v3"}

app = gr.mount_gradio_app(demo, api, path="/")
