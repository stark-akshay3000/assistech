from pydantic import BaseModel
from typing import List, Optional


class CandidateSearchRequest(BaseModel):
    skills: Optional[List[str]] = None
    locations: Optional[List[str]] = None
    job_role: Optional[str] = None
    min_experience: Optional[float] = None