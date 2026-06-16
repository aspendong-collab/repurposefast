"""ailomo-whisper — HF Space Gradio SDK"""
import os, tempfile, logging
import gradio as gr
import yt_dlp

logging.basicConfig(level=logging.INFO)
_model = None

def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        logging.info("Loading Faster-Whisper large-v3 on GPU...")
        _model = WhisperModel("large-v3", device="cuda", compute_type="float16")
        logging.info("✅ Model loaded")
    return _model

def transcribe_youtube(url, lang):
    try:
        # Download audio
        tmpdir = tempfile.mkdtemp()
        outtmpl = os.path.join(tmpdir, "%(id)s.%(ext)s")
        ydl_opts = {"format": "bestaudio[ext=m4a]/bestaudio/best", "outtmpl": outtmpl, "quiet": True, "max_filesize": 50*1024*1024}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            path = os.path.join(tmpdir, f"{info['id']}.m4a")
        if not os.path.exists(path):
            alt = os.path.join(tmpdir, f"{info['id']}.webm")
            if os.path.exists(alt): path = alt
            else: return "Error: download failed", "", 0

        # Transcribe
        model = get_model()
        segments, info_data = model.transcribe(path, language=lang or None, beam_size=5, vad_filter=True)
        seg_list = list(segments)
        text = " ".join(s.text.strip() for s in seg_list)

        # Cleanup
        os.remove(path)
        os.rmdir(tmpdir)

        logging.info(f"Done: {len(seg_list)} segs, {len(text)} chars, lang={info_data.language}")
        return text, info_data.language or "en", info_data.duration
    except Exception as e:
        logging.error(str(e))
        return f"Error: {e}", "", 0

# ── Gradio UI ──
demo = gr.Interface(
    fn=transcribe_youtube,
    inputs=[
        gr.Textbox(label="YouTube URL", placeholder="https://www.youtube.com/watch?v=..."),
        gr.Textbox(label="Language (optional)", value="en"),
    ],
    outputs=[
        gr.Textbox(label="Transcript", lines=15),
        gr.Textbox(label="Language"),
        gr.Number(label="Duration (sec)"),
    ],
    title="ailomo-whisper",
    description="Free YouTube transcription via Faster-Whisper large-v3 on T4 GPU. Enter a URL and click Submit.",
    theme="soft",
)

if __name__ == "__main__":
    demo.launch()
