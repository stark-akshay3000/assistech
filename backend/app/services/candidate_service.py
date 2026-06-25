from app.database import SessionLocal
from app.models.candidates import Candidate
from sqlalchemy import and_
from sqlalchemy import or_

from app.database import SessionLocal
from app.models.candidates import Candidate


from sqlalchemy import or_, and_
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
        # SKILLS FILTER (FIXED - OLD LOGIC RESTORED)
        # -------------------------
        if filters.skills:

            # We will NOT use SQL contains (it was incorrect)
            # Instead we filter after DB query (same as your old logic)

            pass  # handled after query

        # -------------------------
        # APPLY ALL CONDITIONS (EXCEPT SKILLS)
        # -------------------------
        if conditions:
            query = query.filter(and_(*conditions))

        candidates = query.all()

        # -------------------------
        # SKILLS FILTER (POST DB - RESTORED OLD BEHAVIOR)
        # -------------------------
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
                if required_skills.issubset(candidate_skills):
                    filtered_candidates.append(candidate)

            candidates = filtered_candidates

        return candidates

    finally:
        db.close()