# from fastapi import APIRouter, UploadFile, File
# from typing import List
# from main import router



# @router.post("/upload")
# async def upload_resumes(
#     files: List[UploadFile] = File(...)
# ):
#     return {
#         "files": [file.filename for file in files]
#     }