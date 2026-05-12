from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.resume import Resume
from models.user import User
from routers.auth import get_current_user
from services.ai_service import generate_interview_questions

router = APIRouter(prefix="/interview", tags=["Interview"])


@router.get("/questions")
def get_interview_questions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate personalized interview questions from user's resume.
    """
    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .first()
    )
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload your resume first.",
        )

    try:
        questions = generate_interview_questions(resume.raw_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Question generation failed: {str(e)}",
        )

    return questions