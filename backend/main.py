"""
KTU AI Tutor - FastAPI Backend
================================
FastAPI server that exposes the LangGraph tutor logic via REST API.
In production, also serves the built React frontend as static files.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(
    title="KTU AI Tutor API",
    description="AI-powered learning assistant for KTU CSE students",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str


class AskResponse(BaseModel):
    answer: str
    agent_used: str


class HealthStatus(BaseModel):
    status: str


@app.get("/api/healthz", response_model=HealthStatus)
def health_check():
    return {"status": "ok"}


@app.post("/api/ask", response_model=AskResponse)
def ask(request: AskRequest):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    try:
        from backend.logic import ask_tutor
        result = ask_tutor(request.question.strip())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


STATIC_DIR = Path(__file__).parent / "static"

@app.get("/")
async def serve_index():
    return FileResponse(str(STATIC_DIR / "index.html"))

@app.get("/{full_path:path}")
async def serve_fallback(full_path: str):
    # API routes are handled above; everything else gets the SPA
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(str(STATIC_DIR / "index.html"))


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)
