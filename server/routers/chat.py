from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import get_db
from models.resume import Resume
from models.user import User
from routers.auth import get_current_user
from services.ai_service import chat_career_coach

router = APIRouter(prefix="/chat", tags=["Chat"])


class Message(BaseModel):
    role: str    # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


@router.post("/")
def chat(
    req: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Multi-turn career coaching chatbot.
    Automatically uses user's resume for personalized advice.
    """
    # Load resume for context (if exists)
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .first()
    )
    resume_context = resume.raw_text[:2000] if resume else ""

    messages = [{"role": m.role, "content": m.content} for m in req.messages]

    reply = chat_career_coach(messages, resume_context)
    return {"reply": reply, "has_resume_context": bool(resume_context)}