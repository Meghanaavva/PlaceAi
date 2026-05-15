from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from config import settings

import models  # noqa: F401

from routers import auth, resume, jobs, chat, interview


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)
    print("[PlaceAI] Database tables created/verified ✓")
    yield
    print("[PlaceAI] Shutting down...")


app = FastAPI(
    title="PlaceAI — Placement Assistant API",
    description="AI-powered placement assistant with resume analysis, job matching, and career coaching",
    version="1.0.0",
    lifespan=lifespan,
)

# ✅ Proper CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ API Routes
app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(interview.router, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "PlaceAI Placement Assistant",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "PlaceAI API is healthy"}