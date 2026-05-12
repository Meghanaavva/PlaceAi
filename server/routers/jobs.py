from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from database import get_db
from models.resume import Resume
from models.user import User
from routers.auth import get_current_user
from services.ai_service import recommend_jobs, detect_skill_gap

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/recommendations")
def job_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get AI job recommendations based on user's uploaded resume."""
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
        jobs = recommend_jobs(resume.raw_text)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job recommendation failed: {str(e)}",
        )

    return {"jobs": jobs, "based_on_resume_score": resume.score}


@router.post("/skill-gap")
def skill_gap_analysis(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Analyze skill gap between user's resume and a target job role.
    Body: {"target_role": "Machine Learning Engineer"}
    """
    target_role = payload.get("target_role", "").strip()
    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_role is required",
        )

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
        gap = detect_skill_gap(resume.raw_text, target_role)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Skill gap analysis failed: {str(e)}",
        )

    return gap