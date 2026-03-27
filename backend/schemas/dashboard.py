from pydantic import BaseModel
from typing import List, Optional
from schemas.course import CourseResponse
from schemas.assignment import AssignmentResponse

class DashboardOverview(BaseModel):
    user_name: str
    stats: dict # {course_count: int, assignment_count: int, notifications: int, graded_count: int}
    recent_courses: List[CourseResponse]
    upcoming_assignments: List[AssignmentResponse]
