import pdfplumber
import re
from io import BytesIO


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text content from a PDF file.
    Returns empty string if extraction fails.
    """
    text = ""
    try:
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"[resume_parser] PDF extraction error: {e}")
    return text.strip()


def parse_resume_sections(text: str) -> dict:
    """
    Detect and extract sections from resume text using keyword matching.
    Returns a dict with section names as keys and section text as values.
    """
    sections = {
        "contact": "",
        "summary": "",
        "experience": "",
        "education": "",
        "skills": "",
        "projects": "",
        "certifications": "",
        "achievements": "",
    }

    # Regex patterns to detect section headers
    section_patterns = {
        "summary":        r"(summary|objective|profile|about me|career objective)",
        "experience":     r"(experience|work history|employment|work experience|professional experience)",
        "education":      r"(education|academic|qualification|schooling|academic background)",
        "skills":         r"(skills|technologies|tech stack|competencies|tools|technical skills)",
        "projects":       r"(projects|portfolio|personal projects|academic projects)",
        "certifications": r"(certifications|certificates|awards|licenses|credentials)",
        "achievements":   r"(achievements|accomplishments|honors|distinctions)",
    }

    lines = text.split("\n")
    current_section = "contact"

    for line in lines:
        stripped = line.strip()
        if not stripped:
            sections[current_section] += "\n"
            continue

        line_lower = stripped.lower()
        matched = False

        # Check if this line is a section header (short line matching a pattern)
        if len(line_lower) < 60:
            for section, pattern in section_patterns.items():
                if re.search(pattern, line_lower):
                    current_section = section
                    matched = True
                    break

        if not matched:
            sections[current_section] += stripped + "\n"

    # Clean up extra whitespace
    return {k: v.strip() for k, v in sections.items()}