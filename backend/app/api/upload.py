from fastapi import APIRouter, UploadFile, File
from typing import Annotated
from pathlib import Path

from app.services.parser import extract_pdf_text, extract_docx_text, extract_pdf_links
from app.services.pii_scrubber import extract_contact_info, scrub_text
from app.services.gemini_service import extract_resume_details
from app.services.s3_service import upload_resume
from app.services.candidate_service import save_candidate

router = APIRouter()

@router.post("/upload")
async def upload_resumes(
    files: Annotated[list[UploadFile], File()]
):

    results = []
    success_count = 0
    failed_count = 0

    total_files = len(files)

    print("=" * 80)
    print(f"Received {total_files} files")
    print("=" * 80)

    for index, file in enumerate(files, start=1):

        print("\n" + "=" * 80)
        print(f"Processing File {index}/{total_files}")
        print(f"Filename: {file.filename}")
        print("=" * 80)

        try:

            # --------------------------------------------------
            # Read File
            # --------------------------------------------------

            content = await file.read()

            print(
                f"File read successfully "
                f"({len(content)} bytes)"
            )

            # --------------------------------------------------
            # Upload to S3
            # --------------------------------------------------

            print("Uploading to S3...")

            resume_url = upload_resume(
                content,
                file.filename
            )

            print("S3 upload complete")
            print(resume_url)

            # --------------------------------------------------
            # Determine File Type
            # --------------------------------------------------

            extension = (
                Path(file.filename)
                .suffix
                .lower()
            )

            pdf_links = []

            # --------------------------------------------------
            # Extract Text
            # --------------------------------------------------

            if extension == ".pdf":

                print("Extracting PDF text...")

                text = extract_pdf_text(
                    content
                )

                pdf_links = extract_pdf_links(
                    content
                )

            elif extension == ".docx":

                print("Extracting DOCX text...")

                text = extract_docx_text(
                    content
                )

            else:

                failed_count += 1

                results.append(
                    {
                        "filename": file.filename,
                        "status": "failed",
                        "error":
                        "Unsupported file type"
                    }
                )

                continue

            print(
                f"Text extracted "
                f"({len(text)} characters)"
            )

            # --------------------------------------------------
            # Extract Contact Info
            # --------------------------------------------------

            contact_info = extract_contact_info(
                text=text,
                pdf_links=pdf_links
            )

            print("Contact info extracted")

            # --------------------------------------------------
            # Scrub PII
            # --------------------------------------------------

            scrubbed_text = scrub_text(
                text
            )

            print("PII scrubbed")

            # --------------------------------------------------
            # Gemini
            # --------------------------------------------------

            print("Calling Gemini...")

            ai_data = extract_resume_details(
                scrubbed_text
            )

            print("Gemini complete")

            # --------------------------------------------------
            # Save Candidate
            # --------------------------------------------------

            candidate_id = save_candidate(
                contact_info,
                ai_data,
                resume_url
            )

            print(
                f"Candidate saved "
                f"({candidate_id})"
            )

            success_count += 1

            results.append(
                {
                    "filename": file.filename,
                    "status": "success",
                    "candidate_id":
                        candidate_id,
                    "resume_url":
                        resume_url,
                    "contact_info":
                        contact_info,
                    "ai_data":
                        ai_data
                }
            )

        except Exception as e:

            import traceback

            failed_count += 1

            print(
                f"FAILED: {file.filename}"
            )

            traceback.print_exc()

            results.append(
                {
                    "filename":
                        file.filename,
                    "status":
                        "failed",
                    "error":
                        str(e)
                }
            )

    print("\n" + "=" * 80)
    print("UPLOAD SUMMARY")
    print(f"Total Files: {total_files}")
    print(f"Success: {success_count}")
    print(f"Failed: {failed_count}")
    print("=" * 80)

    return {
        "total_files": total_files,
        "success_count": success_count,
        "failed_count": failed_count,
        "results": results
    }
    