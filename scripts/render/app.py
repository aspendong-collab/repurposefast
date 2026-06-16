"""Render service: yt-dlp download → HF Whisper transcription"""
import os, tempfile, logging, requests
from flask import Flask, request, jsonify
import yt_dlp

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
HF_TOKEN = os.environ.get("HF_TOKEN", "")

def download_audio(url):
    d = tempfile.mkdtemp()
    t = os.path.join(d, "%(id)s.%(ext)s")
    opts = {"format": "worstaudio", "outtmpl": t, "quiet": True, "max_filesize": 25*1024*1024}
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
    for ext in ['.m4a','.webm','.mp4','.opus','.ogg']:
        p = os.path.join(d, f"{info['id']}{ext}")
        if os.path.exists(p): return p, d, info.get('title','')
    raise FileNotFoundError("No audio file found")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    try:
        data = request.get_json(force=True)
        url = data.get("url", "")
        if not url: return jsonify({"error": "url required"}), 400

        logging.info(f"Downloading: {url[:80]}")
        audio_path, tmpdir, title = download_audio(url)
        size_mb = os.path.getsize(audio_path) / 1024 / 1024
        logging.info(f"Downloaded: {size_mb:.1f}MB - {title}")

        # Send to HF Whisper
        if not HF_TOKEN:
            return jsonify({"error": "HF_TOKEN not configured"}), 500

        with open(audio_path, "rb") as f:
            resp = requests.post(
                "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
                headers={"Authorization": f"Bearer {HF_TOKEN}"},
                data=f,
                timeout=120,
            )
        
        os.remove(audio_path)
        os.rmdir(tmpdir)

        result = resp.json()
        if "error" in result:
            # Retry once
            with open(audio_path, "rb") as f:
                resp2 = requests.post(
                    "https://api-inference.huggingface.co/models/openai/whisper-large-v3",
                    headers={"Authorization": f"Bearer {HF_TOKEN}"},
                    data=f, timeout=120,
                )
            result = resp2.json()

        if "error" in result:
            return jsonify({"error": result["error"]}), 500

        return jsonify({
            "text": result.get("text", ""),
            "language": result.get("language", "en"),
            "title": title,
        })
    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": str(e)}), 500

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
