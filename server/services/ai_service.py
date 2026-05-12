import json
import re
from groq import Groq
from config import settings

def get_client():
    return Groq(api_key=settings.GROQ_API_KEY)

CAREER_COACH_SYSTEM = """You are PlaceAI — an expert career coach, resume specialist, and placement advisor 
with 15+ years of experience at top tech companies. You help students and fresh graduates optimize their 
resumes, bridge skill gaps, prepare for interviews, and land their dream jobs.

Always be:
- Specific and actionable (not vague)
- Encouraging but honest
- Focused on practical next steps
- Aware of current industry trends (2024-2025)

When analyzing resumes, focus on ATS optimization, quantified achievements, and modern job market requirements."""


def _clean_json(raw: str) -> str:
    raw = raw.strip()

    # Remove markdown blocks
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"^```\s*", "", raw)
    raw = re.sub(r"```$", "", raw)

    # Find first { and last }
    start = raw.find("{")
    end = raw.rfind("}")

    if start != -1 and end != -1:
        raw = raw[start:end + 1]

    return raw.strip()


def safe_json_load(raw: str):
    try:
        return json.loads(raw)

    except json.JSONDecodeError as e:
        print("JSON PARSE ERROR:", e)
        print("RAW RESPONSE:\n", raw)

        return {
            "score": 70,
            "grade": "B",
            "summary": "Resume uploaded successfully but AI response formatting failed.",
            "sections": {},
            "strengths": ["Resume uploaded"],
            "improvements": ["Retry analysis"],
            "ats_keywords": [],
            "missing_keywords": []
        }


def analyze_resume(resume_text: str) -> dict:
    client = get_client()
    prompt = f"""Analyze this resume thoroughly and return a JSON object with EXACTLY this structure:
{{
  "score": <integer 0-100>,
  "grade": "<A/B+/B/C+/C/D>",
  "summary": "<2-3 sentence honest overall assessment>",
  "sections": {{
    "contact":    {{"score": <0-100>, "feedback": "<specific actionable feedback>"}},
    "summary":    {{"score": <0-100>, "feedback": "<specific actionable feedback>"}}],
    "experience": {{"score": <0-100>, "feedback": "<specific actionable feedback>"}}],
    "education":  {{"score": <0-100>, "feedback": "<specific actionable feedback>"}}],
    "skills":     {{"score": <0-100>, "feedback": "<specific actionable feedback>"}}]
  }},
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>", "<improvement 4>"],
  "ats_keywords": ["<keyword found>", ...],
  "missing_keywords": ["<keyword missing>", ...]
}}

Resume:
{resume_text[:4000]}

Return ONLY the JSON object. No markdown. No explanation."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": CAREER_COACH_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=2000,
    )
    raw = _clean_json(response.choices[0].message.content)
    return safe_json_load(raw)


def recommend_jobs(resume_text: str) -> list:
    client = get_client()
    prompt = f"""Based on this resume, recommend 6 suitable job roles. Return EXACTLY this JSON array:
[
  {{
    "title": "<Job Title>",
    "match": <60-99>,
    "reason": "<why this person is a good fit>",
    "skills_needed": ["<skill1>", "<skill2>"],
    "avg_salary": "<salary range>",
    "companies": ["<company1>", "<company2>", "<company3>"]
  }}
]

Resume:
{resume_text[:3000]}

Return ONLY the JSON array."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": CAREER_COACH_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=2000,
    )
    raw = _clean_json(response.choices[0].message.content)
    return json.loads(raw)


def detect_skill_gap(resume_text: str, target_role: str) -> dict:
    client = get_client()
    prompt = f"""Analyze the skill gap between this resume and the target role: {target_role}

Return EXACTLY this JSON:
{{
  "target_role": "{target_role}",
  "match_percentage": <0-100>,
  "current_skills": ["<skill1>", "<skill2>", ...],
  "missing_skills": [
    {{"skill": "<name>", "priority": "high|medium|low", "resource": "<free learning resource URL>"}}
  ],
  "timeline": "<realistic timeline to be job-ready>",
  "roadmap": ["<step 1>", "<step 2>", "<step 3>", "<step 4>"]
}}

Resume:
{resume_text[:3000]}

Return ONLY the JSON object."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": CAREER_COACH_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=2000,
    )
    raw = _clean_json(response.choices[0].message.content)
    return safe_json_load(raw)


def generate_interview_questions(resume_text: str) -> dict:
    client = get_client()
    prompt = f"""Generate interview questions for this resume. Return EXACTLY this JSON:
{{
  "behavioral": [
    {{"question": "<question>", "tip": "<STAR method guidance>", "focus": "<what interviewer wants>"}},
    {{"question": "<question>", "tip": "<tip>", "focus": "<focus>"}},
    {{"question": "<question>", "tip": "<tip>", "focus": "<focus>"}},
    {{"question": "<question>", "tip": "<tip>", "focus": "<focus>"}},
    {{"question": "<question>", "tip": "<tip>", "focus": "<focus>"}}
  ],
  "technical": [
    {{"question": "<question>", "tip": "<tip>", "difficulty": "easy|medium|hard"}},
    {{"question": "<question>", "tip": "<tip>", "difficulty": "easy|medium|hard"}},
    {{"question": "<question>", "tip": "<tip>", "difficulty": "easy|medium|hard"}},
    {{"question": "<question>", "tip": "<tip>", "difficulty": "easy|medium|hard"}},
    {{"question": "<question>", "tip": "<tip>", "difficulty": "easy|medium|hard"}}
  ],
  "situational": [
    {{"question": "<question>", "tip": "<tip>"}},
    {{"question": "<question>", "tip": "<tip>"}},
    {{"question": "<question>", "tip": "<tip>"}}
  ],
  "questions_to_ask_interviewer": ["<question1>", "<question2>", "<question3>"]
}}

Resume:
{resume_text[:3000]}

Return ONLY the JSON object."""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": CAREER_COACH_SYSTEM},
            {"role": "user", "content": prompt},
        ],
        temperature=0.5,
        max_tokens=2000,
    )
    raw = _clean_json(response.choices[0].message.content)
    return safe_json_load(raw)


def chat_career_coach(messages: list, resume_context: str = "") -> str:
    client = get_client()
    system = CAREER_COACH_SYSTEM
    if resume_context:
        system += f"\n\nUser's resume context:\n{resume_context[:2000]}\n\nPersonalize advice based on their experience."

    api_messages = [{"role": "system", "content": system}] + messages

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=api_messages,
        temperature=0.7,
        max_tokens=800,
    )
    return response.choices[0].message.content