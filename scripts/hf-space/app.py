"""HF Space: ailomo-whisper — no Gradio, pure FastAPI."""
import os, tempfile, logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
from faster_whisper import WhisperModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api = FastAPI(title="ailomo-whisper")
_model = None

def get_model():
    global _model
    if _model is None:
        logger.info("Loading Faster-Whisper large-v3...")
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
        "outtmpl": outtmpl, "quiet": True, "no_warnings": True,
        "max_filesize": 50 * 1024 * 1024,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        path = os.path.join(tmpdir, f"{info['id']}.m4a")
    if not os.path.exists(path):
        alt = os.path.join(tmpdir, f"{info['id']}.webm")
        if os.path.exists(alt): return alt
        raise FileNotFoundError("Audio download failed")
    return path

@api.post("/transcribe")
def transcribe(req: TranscribeRequest):
    try:
        logger.info(f"Downloading: {req.url[:80]}")
        audio_path = download_audio(req.url)
        logger.info(f"Audio: {os.path.getsize(audio_path)/1024/1024:.1f}MB")

        model = get_model()
        segments, info = model.transcribe(audio_path, language=req.language, beam_size=5, vad_filter=True)
        seg_list = list(segments)
        text = " ".join(s.text.strip() for s in seg_list)

        os.remove(audio_path)
        os.rmdir(os.path.dirname(audio_path))

        logger.info(f"Done: {len(seg_list)} segments, {len(text)} chars, lang={info.language}")
        return {
            "text": text,
            "language": info.language or "en",
            "duration": info.duration,
            "segments": [{"start": int(s.start), "end": int(s.end), "text": s.text.strip()} for s in seg_list],
        }
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api.get("/health")
def health():
    return {"status": "ok", "model": "large-v3"}
