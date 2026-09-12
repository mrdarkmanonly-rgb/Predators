from pydantic import BaseModel, Field


class QualityCheckRequest(BaseModel):
    image_url: str


class QualityCheckResponse(BaseModel):
    passed: bool
    score: float = Field(ge=0, le=100)

    width: int
    height: int

    blur_score: float
    brightness_score: float

    issues: list[str]
    recommendations: list[str]