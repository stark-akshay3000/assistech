import json
import os

import google.generativeai as genai

from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel(
    "gemini-3-flash-preview"
)


def extract_resume_details(
    resume_text: str
):
    prompt = f"""
You are a resume parser.

Extract the following fields:

1. name (string)
2. skills (array of strings)
3. total_years_experience (number)
4. most_recent_job_title (string - as written in resume)
5. job_role (choose ONLY from predefined categories)
6. location (string)

IMPORTANT:
job_role MUST be one of:

- SOFTWARE_ENGINEER
- ML_ENGINEER
- BACKEND_ENGINEER
- FRONTEND_ENGINEER
- FULL_STACK_ENGINEER
- AI_ENGINEER
- DATA_SCIENTIST
- DEVOPS_ENGINEER
- MOBILE_ENGINEER
- PRODUCT_MANAGER
- OTHER

If unsure → use "OTHER"

Return ONLY valid JSON.

Example:
{{
  "name": "John Doe",
  "skills": ["Python", "AWS"],
  "total_years_experience": 3,
  "most_recent_job_title": "Full Stack AI Engineer",
  "job_role": "AI_ENGINEER",
  "location": "Bangalore"
}}

Resume:
{resume_text}
"""

    response = model.generate_content(
        prompt
    )

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace(
            "```json",
            ""
        )

        text = text.replace(
            "```",
            ""
        )

    return json.loads(text)