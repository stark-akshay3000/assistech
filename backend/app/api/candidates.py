from fastapi import APIRouter
from app.services.candidate_service import (
    get_all_candidates,
    get_candidate_by_id
)

from app.schemas.search import CandidateSearchRequest
from app.services.candidate_service import search_candidates

router = APIRouter()

@router.get("/candidates")
def candidates():

    rows = get_all_candidates()

    return [
        {
            "id": str(row.id),
            "name": row.name,
            "email": row.email,
            "location": row.location,
            "total_experience": row.total_experience,
            "recent_job_title": row.recent_job_title,
            "skills": row.skills
        }
        for row in rows
    ]
    
@router.post("/candidates/search")
def search(filters: CandidateSearchRequest):

    candidates = search_candidates(
        filters
    )

    return [
        {
            "id": str(candidate.id),
            "name": candidate.name,
            "email": candidate.email,
            "location": candidate.location,
            "experience": candidate.total_experience,
            "recent_job_title":
                candidate.recent_job_title,
            "skills": candidate.skills
        }
        for candidate in candidates
    ]
    
       
   
@router.get("/candidates/{candidate_id}")
def candidate_detail(candidate_id: str):

    candidate = get_candidate_by_id(candidate_id)

    if not candidate:
        return {"error": "Candidate not found"}

    return {
        "id": str(candidate.id),
        "name": candidate.name,
        "email": candidate.email,
        "phone": candidate.phone,
        "linkedin_url": candidate.linkedin_url,
        "github_url": candidate.github_url,
        "location": candidate.location,
        "total_experience": candidate.total_experience,
        "recent_job_title": candidate.recent_job_title,
        "resume_file_url": candidate.resume_file_url,
        "skills": candidate.skills
    }    
    
    