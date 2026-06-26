from fastapi import APIRouter

from app.services.progress_manager import (
    get_progress,
)

router = APIRouter()


@router.get("/progress/{job_id}")
def progress(job_id: str):

    return get_progress(job_id)