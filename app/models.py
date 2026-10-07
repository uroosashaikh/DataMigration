from pydantic import BaseModel
from typing import Optional

class Mapping(BaseModel):
    source_field: str
    target_field: str
    confidence: float
    reasoning: str
    risk_level: Optional[str] = None
    comments: Optional[str] = None

class MappingResponse(BaseModel):
    mappings: list[Mapping]