"""ailomo-whisper — Blocks + REST API"""
import os, tempfile, logging
import gradio as gr
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
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

def dl(url):
    d = tempfile.mkdtemp()
    t = os.path.join(d, "%(id)s.%(ext)s")
    o = {"format": "bestaudio[ext=m4a]/bestaudio/best", "outtmpl": t, "quiet": True, "max_filesize": 50*1024*1024}
    with yt_dlp.YoutubeDL(o) as y:
        i = y.extract_info(url, download=True)
        p = os.path.join(d, f"{i['id']}.m4a")
    if not os.path.exists(p):
        p2 = os.path.join(d, f"{i['id']}.webm")
        if os.path.exists(p2): p = p2
        else: raise FileNotFoundError("Download failed")
    return p, d

def tf(path, lang):
    m = get_model()
    s, info = m.transcribe(path, language=lang or None, beam_size=5, vad_filter=True)
    sl = list(s)
    return " ".join(x.text.strip() for x in sl), info.language or "en", info.duration

# ── Gradio Blocks ──
def gui_fn(url, lang):
    try:
        p, d = dl(url)
        text, ld, dur = tf(p, lang)
        os.remove(p); os.rmdir(d)
        return text, ld, dur
    except Exception as e:
        return f"Error: {e}", "", 0

with gr.Blocks(title="ailomo-whisper") as demo:
    gr.Markdown("# 🎙️ ailomo-whisper\nFaster-Whisper large-v3 on T4 GPU")
    u = gr.Textbox(label="YouTube URL")
    l = gr.Textbox(label="Language", value="en")
    b = gr.Button("Transcribe", variant="primary")
    t = gr.Textbox(label="Transcript", lines=12)
    lo = gr.Textbox(label="Lang")
    du = gr.Number(label="Duration")
    b.click(fn=gui_fn, inputs=[u, l], outputs=[t, lo, du])

# ── REST API ──
api = FastAPI()

class TR(BaseModel):
    url: str
    language: str | None = None

@api.post("/transcribe")
def api_transcribe(req: TR):
    try:
        p, d = dl(req.url)
        text, lang, dur = tf(p, req.language)
        os.remove(p); os.rmdir(d)
        return {"text": text, "language": lang, "duration": dur}
    except Exception as e:
        raise HTTPException(500, str(e))

@api.get("/health")
def h():
    return {"status": "ok", "model": "large-v3", "device": "cuda"}

# Mount (Gradio 5/6 compatible)
app = gr.mount_gradio_app(app=api, blocks=demo, path="/")
