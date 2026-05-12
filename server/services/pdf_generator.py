from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from io import BytesIO


# Color palette
BLUE = colors.HexColor("#1a56db")
DARK = colors.HexColor("#1e293b")
GRAY = colors.HexColor("#64748b")
LIGHT_GRAY = colors.HexColor("#e2e8f0")


def generate_resume_pdf(data: dict) -> bytes:
    """
    Generate a professional, ATS-friendly PDF resume from form data.

    Args:
        data: dict with keys: full_name, email, phone, location, linkedin,
              github, summary, experience, education, skills, projects, certifications

    Returns:
        PDF as bytes
    """
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.7 * inch,
        leftMargin=0.7 * inch,
        topMargin=0.65 * inch,
        bottomMargin=0.65 * inch,
    )

    # ── Paragraph styles ──────────────────────────────────────────
    name_style = ParagraphStyle(
        "Name",
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=DARK,
        spaceAfter=4,
        leading=26,
    )
    contact_style = ParagraphStyle(
        "Contact",
        fontName="Helvetica",
        fontSize=9,
        textColor=GRAY,
        spaceAfter=14,
        leading=14,
    )
    section_heading_style = ParagraphStyle(
        "SectionHeading",
        fontName="Helvetica-Bold",
        fontSize=11,
        textColor=BLUE,
        spaceBefore=14,
        spaceAfter=3,
        leading=16,
        textTransform="uppercase",
    )
    body_style = ParagraphStyle(
        "Body",
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK,
        spaceAfter=3,
        leading=15,
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        fontName="Helvetica",
        fontSize=10,
        textColor=DARK,
        spaceAfter=2,
        leading=14,
        leftIndent=12,
        bulletIndent=0,
    )

    story = []

    # ── Header: Name + Contact ────────────────────────────────────
    story.append(Paragraph(data.get("full_name", "Your Name"), name_style))

    contact_parts = [
        p for p in [
            data.get("email", ""),
            data.get("phone", ""),
            data.get("location", ""),
            data.get("linkedin", ""),
            data.get("github", ""),
        ] if p and p.strip()
    ]
    if contact_parts:
        story.append(Paragraph(" · ".join(contact_parts), contact_style))

    story.append(HRFlowable(width="100%", thickness=2, color=BLUE, spaceAfter=2))

    # ── Helper: add a section ─────────────────────────────────────
    def add_section(title: str, content: str):
        if not content or not content.strip():
            return
        story.append(Paragraph(title.upper(), section_heading_style))
        story.append(HRFlowable(width="100%", thickness=0.5, color=LIGHT_GRAY, spaceAfter=5))

        for line in content.strip().split("\n"):
            line = line.strip()
            if not line:
                story.append(Spacer(1, 4))
                continue
            if line.startswith("•") or line.startswith("-") or line.startswith("*"):
                clean = line.lstrip("•-* ").strip()
                story.append(Paragraph(f"• {clean}", bullet_style))
            else:
                story.append(Paragraph(line, body_style))

    # ── Sections ──────────────────────────────────────────────────
    add_section("Professional Summary", data.get("summary", ""))
    add_section("Work Experience",      data.get("experience", ""))
    add_section("Education",            data.get("education", ""))
    add_section("Skills",               data.get("skills", ""))
    add_section("Projects",             data.get("projects", ""))
    add_section("Certifications",       data.get("certifications", ""))

    doc.build(story)
    return buffer.getvalue()