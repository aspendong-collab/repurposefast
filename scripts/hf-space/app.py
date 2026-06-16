"""ailomo-whisper HF Space"""
import os, tempfile, logging
import gradio as gr
from pydantic import BaseModel
import yt_dlp

logging.basicConfig(level=logging.INFO)
_model = None

def get_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel
        _model = WhisperModel("large-v3", device="cuda", compute_type="float16")
    return _model

def dl(u):
    d=tempfile.mkdtemp();t=os.path.join(d,"%(id)s.%(ext)s")
    o={"format":"bestaudio[ext=m4a]/bestaudio/best","outtmpl":t,"quiet":True,"max_filesize":50*1024*1024}
    with yt_dlp.YoutubeDL(o) as y:
        i=y.extract_info(u,download=True);p=os.path.join(d,f"{i['id']}.m4a")
    if not os.path.exists(p):
        p2=os.path.join(d,f"{i['id']}.webm")
        if os.path.exists(p2):p=p2
        else:raise FileNotFoundError("download failed")
    return p,d

def tf(path,lang):
    m=get_model();s,info=m.transcribe(path,language=lang or None,beam_size=5,vad_filter=True)
    sl=list(s);return " ".join(x.text.strip() for x in sl),info.language or "en",info.duration

# Gradio UI
def gui_fn(url,lang):
    try:p,d=dl(url);t,ld,du=tf(p,lang);os.remove(p);os.rmdir(d);return t,ld,du
    except Exception as e:return f"Error: {e}","",0

demo=gr.Interface(fn=gui_fn,inputs=[gr.Textbox(label="YouTube URL"),gr.Textbox(label="Language",value="en")],outputs=[gr.Textbox(label="Transcript",lines=12),gr.Textbox(label="Lang"),gr.Number(label="Duration")],title="ailomo-whisper",description="Faster-Whisper large-v3 on T4 GPU")

# REST API
from fastapi.responses import JSONResponse
from fastapi import Request

async def health(_:Request):return JSONResponse({"status":"ok","model":"large-v3"})

async def transcribe(request:Request):
    try:
        b=await request.json()
        p,d=dl(b["url"]);t,lang,dur=tf(p,b.get("language"))
        os.remove(p);os.rmdir(d)
        return JSONResponse({"text":t,"language":lang,"duration":dur})
    except Exception as e:return JSONResponse({"error":str(e)},500)

demo.app.add_api_route("/health",health,methods=["GET"])
demo.app.add_api_route("/transcribe",transcribe,methods=["POST"])
