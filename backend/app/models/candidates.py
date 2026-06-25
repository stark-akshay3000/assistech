from sqlalchemy import Column
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime
from sqlalchemy import Text

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.dialects.postgresql import JSONB

from datetime import datetime
import uuid

from app.database import Base


class Candidate(Base):

    __tablename__ = "candidates"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name = Column(Text)

    email = Column(Text)

    phone = Column(Text)

    linkedin_url = Column(Text)

    github_url = Column(Text)

    location = Column(Text)

    total_experience = Column(Float)

    recent_job_title = Column(Text)

    skills = Column(JSONB)

    resume_file_url = Column(Text)

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )