from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import upload, candidates, progress
from app.database import engine, SessionLocal, Base
from app.models.candidates import Candidate


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    yield


app = FastAPI(
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://assistech-zeta.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(candidates.router)
app.include_router(progress.router)


@app.get("/db-test")
def db_test():
    db = SessionLocal()
    try:
        return {"status": "connected"}
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Resume Search API"
    }