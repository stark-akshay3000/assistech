from app.database import SessionLocal
from app.models.candidates import Candidate
from app.database import SessionLocal
from app.models.candidates import Candidate
from sqlalchemy import and_

def save_candidate(
    contact_info,
    ai_data,
    resume_url
    
):
    db = SessionLocal()

    try:

        candidate = Candidate(
            email=contact_info.get("email"),
            phone=contact_info.get("phone"),

            linkedin_url=
            contact_info.get("linkedin"),

            github_url=
            contact_info.get("github"),
            name=
            ai_data.get("name"),
            location=
            ai_data.get("location"),
            resume_file_url=resume_url,

            total_experience=
            ai_data.get(
                "total_years_experience"
            ),

            recent_job_title=
            ai_data.get(
                "most_recent_job_title"
            ),

            skills=
            ai_data.get("skills")
        )

        db.add(candidate)

        db.commit()

        db.refresh(candidate)

        return str(candidate.id)

    finally:

        db.close()
        
        



def get_all_candidates():
    db = SessionLocal()

    try:
        return db.query(Candidate).all()

    finally:
        db.close()
        
def get_candidate_by_id(candidate_id):
    db = SessionLocal()

    try:
        return (
            db.query(Candidate)
            .filter(Candidate.id == candidate_id)
            .first()
        )

    finally:
        db.close()        
        
        
        
from sqlalchemy import or_

from app.database import SessionLocal
from app.models.candidates import Candidate


def search_candidates(filters):
    db = SessionLocal()

    try:
        query = db.query(Candidate)

        # Experience filter
        if filters.min_experience is not None:
            query = query.filter(
                Candidate.total_experience >= filters.min_experience
            )

        # Location filter
        if filters.locations:

            location_conditions = []

            for location in filters.locations:
                location_conditions.append(
                    Candidate.location.ilike(
                        f"%{location}%"
                    )
                )

            query = query.filter(
                or_(*location_conditions)
            )

        # Job title filter
        if filters.job_titles:

            title_conditions = []

            for title in filters.job_titles:
                title_conditions.append(
                    Candidate.recent_job_title.ilike(
                        f"%{title}%"
                    )
                )

            query = query.filter(
                or_(*title_conditions)
            )

        candidates = query.all()

        # Skills filter
        if filters.skills:

            filtered_candidates = []

            required_skills = {
                skill.lower().strip()
                for skill in filters.skills
            }

            for candidate in candidates:

                candidate_skills = {
                    skill.lower().strip()
                    for skill in (candidate.skills or [])
                }

                # Candidate must have ALL requested skills
                if required_skills.issubset(
                    candidate_skills
                ):
                    filtered_candidates.append(
                        candidate
                    )

            candidates = filtered_candidates

        return candidates

    finally:
        db.close()