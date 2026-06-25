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

Extract:

1. name (string)
2. skills (array)
3. total_years_experience (number)
4. most_recent_job_title
5. location

Return ONLY valid JSON.

Example:

{{
  "name": "John Doe",
  "skills": ["Python", "AWS"],
  "total_years_experience": 3,
  "most_recent_job_title": "Software Engineer",
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