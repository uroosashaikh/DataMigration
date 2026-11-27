from pydantic import BaseModel
from typing import Literal, Optional

class Mapping(BaseModel):
    source_field: str
    target_field: str
    confidence: float
    reasoning: str
    risk_level: Optional[str] = None
    comments: Optional[str] = None

class MappingResponse(BaseModel):
    mappings: list[Mapping]

class MappingReviewRequest(BaseModel):
    action: Literal["approve", "reject", "update"]
    target_field: Optional[str] = None
    comment: Optional[str] = None