from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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


# ✅ Custom CORS middleware — works for ALL vercel URLs forever
@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")

    # Handle preflight OPTIONS request
    if request.method == "OPTIONS":
        response = JSONResponse(content={}, status_code=200)
        response.headers["Access-Control-Allow-Origin"] = origin or "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
        return response

    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = origin or "*"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
    return response


app.include_router(auth.router,      prefix="/api")
app.include_router(resume.router,    prefix="/api")
app.include_router(jobs.router,      prefix="/api")
app.include_router(chat.router,      prefix="/api")
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