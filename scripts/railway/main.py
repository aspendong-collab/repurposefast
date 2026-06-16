"""
Railway transcription microservice — yt-dlp + Faster-Whisper.
Deploy: railway up (auto-detects FastAPI)
Endpoint: POST /transcribe  { url: "youtube_url" }
Returns:  { text, language, segments, duration }
Cost:     Railway hobby plan ~$5/mo
"""

import os, sys, tempfile, logging
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import yt_dlp
from faster_whisper import WhisperModel

logging.basicConfig(level=logging.INFO)
app = FastAPI(title="ailomo-whisper")

# Lazy-load model (loads on first request to save cold start time)
_model = None

def get_model():
    global _model
    if _model is None:
        logging.info("Loading Faster-Whisper large-v3...")
        _model = WhisperModel("large-v3", device="cpu", compute_type="int8")
        logging.info("Model loaded")
    return _model

class TranscribeRequest(BaseModel):
    url: str
    language: str | None = None

class TranscribeResponse(BaseModel):
    text: str
    language: str
    duration: float
    segments: list[dict] = []

def download_youtube_audio(url: str) -> str:
    """Download audio from YouTube URL, return path to audio file."""
    tmpdir = tempfile.mkdtemp()
    outtmpl = os.path.join(tmpdir, "%(id)s.%(ext)s")

    ydl_opts = {
        "format": "bestaudio[ext=m4a]/bestaudio",
        "outtmpl": outtmpl,
        "quiet": True,
        "no_warnings": True,
        "postprocessors": [],
        "max_filesize": 50 * 1024 * 1024,  # 50MB max
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info["id"]
        audio_path = os.path.join(tmpdir, f"{video_id}.m4a")

    if not os.path.exists(audio_path):
        # Try .webm fallback
        alt = os.path.join(tmpdir, f"{video_id}.webm")
        if os.path.exists(alt):
            return alt
        raise FileNotFoundError(f"Audio file not found at {audio_path}")

    return audio_path

@app.post("/transcribe", response_model=TranscribeResponse)
def transcribe(req: TranscribeRequest):
    try:
        logging.info(f"Downloading: {req.url[:80]}")
        audio_path = download_youtube_audio(req.url)

        file_size = os.path.getsize(audio_path) / (1024 * 1024)
        logging.info(f"Audio downloaded: {file_size:.1f}MB")

        model = get_model()
        segments, info = model.transcribe(
            audio_path,
            language=req.language,
            beam_size=5,
            vad_filter=True,
        )

        segments_list = list(segments)
        full_text = " ".join(s.segment.text for s in segments_list)

        # Cleanup
        os.remove(audio_path)
        os.rmdir(os.path.dirname(audio_path))

        logging.info(f"Transcribed: {len(segments_list)} segments, {len(full_text)} chars, lang={info.language}")

        return TranscribeResponse(
            text=full_text.strip(),
            language=info.language or "en",
            duration=info.duration,
            segments=[{"start": int(s.segment.start), "end": int(s.segment.end), "text": s.segment.text.strip()} for s in segments_list],
        )

    except Exception as e:
        logging.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "model": "large-v3"}
