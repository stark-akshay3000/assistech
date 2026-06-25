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
                "job_role"
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


from sqlalchemy import or_, and_

def search_candidates(filters):
    db = SessionLocal()

    try:
        query = db.query(Candidate)

        conditions = []

        # -------------------------
        # EXPERIENCE
        # -------------------------
        if filters.min_experience is not None:
            conditions.append(
                Candidate.total_experience >= filters.min_experience
            )

        # -------------------------
        # LOCATION FILTER (OR logic)
        # -------------------------
        if filters.locations:
            conditions.append(
                or_(
                    *[
                        Candidate.location.ilike(f"%{loc}%")
                        for loc in filters.locations
                    ]
                )
            )

        # -------------------------
        # JOB ROLE FILTER (NEW - CLEAN & CORRECT)
        # -------------------------
        if filters.job_role:
            conditions.append(
                Candidate.recent_job_title == filters.job_role
            )

        # -------------------------
        # SKILLS FILTER (ALL match)
        # -------------------------
        if filters.skills:
            conditions.append(
                Candidate.skills.contains(filters.skills)
            )

        # -------------------------
        # APPLY ALL CONDITIONS
        # -------------------------
        if conditions:
            query = query.filter(and_(*conditions))

        return query.all()

    finally:
        db.close()