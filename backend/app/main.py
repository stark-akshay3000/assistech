from pathlib import Path
from typing import Annotated, Optional, List
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.api import upload, candidates , progress
from app.database import engine,SessionLocal
from app.models.candidates import Candidate
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://assistech-zeta.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Candidate.metadata.create_all(bind=engine)

app.include_router(upload.router)
app.include_router(candidates.router)
app.include_router(progress.router)

@app.get("/db-test")
def db_test():
    
    db = SessionLocal()
    return {"status": "connected"}
@app.get("/")
def root():
    return {
        "message": "Resume Search API"
    }    
    

   