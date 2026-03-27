from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    course_id: int

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentResponse(AssignmentBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    assignment_id: int
    content: str

class SubmissionCreate(SubmissionBase):
    user_email: str

class SubmissionResponse(SubmissionBase):
    id: int
    user_id: int
    submitted_at: datetime
    grade: Optional[str] = None

    class Config:
        from_attributes = True
