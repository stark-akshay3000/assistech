from fastapi import APIRouter, UploadFile, File, Form
from fastapi.concurrency import run_in_threadpool
from typing import Annotated
from pathlib import Path
import traceback

from app.services.progress_manager import (
    create_progress,
    update_progress,
    fail_progress,
    finish_progress,
)

from app.services.parser import (
    extract_pdf_text,
    extract_docx_text,
    extract_pdf_links,
)

from app.services.pii_scrubber import (
    extract_contact_info,
    scrub_text,
)

from app.services.gemini_service import (
    extract_resume_details,
)

from app.services.s3_service import (
    upload_resume,
)

from app.services.candidate_service import (
    save_candidate,
)

router = APIRouter()


def _process_single_file(content: bytes, filename: str):
    """
    All the blocking / CPU-bound work for one file.
    Runs inside a threadpool (see run_in_threadpool below) so it
    never blocks the event loop, which means GET /progress/{job_id}
    keeps responding instantly while this runs.
    """

    resume_url = upload_resume(
        content,
        filename,
    )

    extension = Path(filename).suffix.lower()

    pdf_links = []

    if extension == ".pdf":
        text = extract_pdf_text(content)
        pdf_links = extract_pdf_links(content)

    elif extension == ".docx":
        text = extract_docx_text(content)

    else:
        return {
            "filename": filename,
            "status": "failed",
            "error": "Unsupported file",
        }

    contact_info = extract_contact_info(
        text=text,
        pdf_links=pdf_links,
    )

    scrubbed_text = scrub_text(text)

    ai_data = extract_resume_details(scrubbed_text)

    candidate_id = save_candidate(
        contact_info,
        ai_data,
        resume_url,
    )

    return {
        "filename": filename,
        "status": "success",
        "candidate_id": candidate_id,
        "resume_url": resume_url,
    }


@router.post("/upload")
async def upload_resumes(
    job_id: Annotated[str, Form()],
    files: Annotated[list[UploadFile], File()],
):
    """
    job_id is now generated on the CLIENT and passed in, so the
    frontend can start polling /progress/{job_id} the instant it
    fires this request off — it doesn't have to wait for the
    response to know what to poll.
    """

    total_files = len(files)

    create_progress(job_id, total_files)

    results = []
    success_count = 0
    failed_count = 0

    print("=" * 80)
    print(f"JOB ID : {job_id}")
    print(f"FILES : {total_files}")
    print("=" * 80)

    for index, file in enumerate(files, start=1):

        print("=" * 80)
        print(f"Processing {index}/{total_files}")
        print(file.filename)
        print("=" * 80)

        try:
            content = await file.read()

            # Run the blocking work in a worker thread so this
            # coroutine yields control back to the event loop and
            # progress polling requests can still be served.
            result = await run_in_threadpool(
                _process_single_file,
                content,
                file.filename,
            )

            if result["status"] == "failed":
                failed_count += 1
                fail_progress(job_id)
            else:
                success_count += 1
                update_progress(job_id)

            results.append(result)

        except Exception:
            traceback.print_exc()

            failed_count += 1
            fail_progress(job_id)

            results.append(
                {
                    "filename": file.filename,
                    "status": "failed",
                }
            )

    finish_progress(job_id)

    return {
        "job_id": job_id,
        "total_files": total_files,
        "success_count": success_count,
        "failed_count": failed_count,
        "results": results,
    }