from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import json

from database import get_db
from models.user import User
from models.resume import Resume
from routers.auth import get_current_user
from services.resume_parser import extract_text_from_pdf, parse_resume_sections
from services.ai_service import analyze_resume
from services.pdf_generator import generate_resume_pdf

router = APIRouter(prefix="/resume", tags=["Resume"])


# ── Pydantic schemas ──────────────────────────────────────────────

class ResumeBuilderData(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    summary: Optional[str] = ""
    experience: Optional[str] = ""
    education: Optional[str] = ""
    skills: Optional[str] = ""
    projects: Optional[str] = ""
    certifications: Optional[str] = ""


# ── Routes ────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a PDF resume. Extracts text, parses sections, runs AI analysis.
    Saves to DB and returns full analysis.
    """

    # Validate file type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported",
        )

    # Validate file size (max 5MB)
    content = await file.read()

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size must be under 5MB",
        )

    # Extract and parse text
    raw_text = extract_text_from_pdf(content)

    print("RAW TEXT EXTRACTED:")
    print(raw_text[:500])

    parsed_sections = parse_resume_sections(raw_text)

    print("PARSED SECTIONS:")
    print(parsed_sections)

    if not raw_text or len(raw_text.strip()) < 50:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract readable text from this PDF. Please ensure it is not scanned/image-based.",
        )

    parsed_sections = parse_resume_sections(raw_text)

    # Run AI analysis
    try:
        analysis = analyze_resume(raw_text)

        print("AI ANALYSIS SUCCESS")
        print(analysis)

    except Exception as e:
        print("AI ANALYSIS ERROR:")
        print(str(e))

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}",
        )

    # Delete previous resume for this user (keep latest only)
    db.query(Resume).filter(Resume.user_id == current_user.id).delete()

    # Save new resume
    resume = Resume(
        user_id=current_user.id,
        filename=file.filename,
        raw_text=raw_text,
        parsed_data=json.dumps(parsed_sections),
        score=float(analysis.get("score", 0)),
        analysis=json.dumps(analysis),
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "filename": resume.filename,
        "score": resume.score,
        "parsed": parsed_sections,
        "analysis": analysis,
        "created_at": resume.created_at.isoformat(),
    }


@router.get("/my")
def get_my_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get the current user's latest resume with analysis.
    Returns null if no resume has been uploaded yet.
    """

    resume = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.created_at.desc())
        .first()
    )

    if not resume:
        return {"resume": None}

    return {
        "id": resume.id,
        "filename": resume.filename,
        "score": resume.score,
        "raw_text": resume.raw_text,
        "parsed": json.loads(resume.parsed_data or "{}"),
        "analysis": json.loads(resume.analysis or "{}"),
        "created_at": resume.created_at.isoformat() if resume.created_at else None,
    }


@router.delete("/my")
def delete_my_resume(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the current user's resume."""

    deleted = db.query(Resume).filter(Resume.user_id == current_user.id).delete()

    db.commit()

    return {
        "deleted": deleted > 0,
        "message": "Resume deleted successfully",
    }


@router.post("/build-pdf")
def build_resume_pdf(
    data: ResumeBuilderData,
    current_user: User = Depends(get_current_user),
):
    """Generate and return a downloadable professional PDF resume."""

    try:
        pdf_bytes = generate_resume_pdf(data.model_dump())

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF generation failed: {str(e)}",
        )

    safe_name = current_user.full_name.replace(" ", "_")

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="resume_{safe_name}.pdf"',
            "Content-Length": str(len(pdf_bytes)),
        },
    )


@router.post("/analyze-text")
def analyze_text_resume(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze pasted resume text directly (no file upload)."""

    text = payload.get("text", "").strip()

    if len(text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is too short to analyze",
        )

    try:
        analysis = analyze_resume(text)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}",
        )

    # Save/update in DB
    db.query(Resume).filter(Resume.user_id == current_user.id).delete()

    resume = Resume(
        user_id=current_user.id,
        filename="pasted_text",
        raw_text=text,
        parsed_data=json.dumps(parse_resume_sections(text)),
        score=float(analysis.get("score", 0)),
        analysis=json.dumps(analysis),
    )

    db.add(resume)
    db.commit()

    return {
        "score": analysis.get("score", 0),
        "analysis": analysis,
    }