from fastapi import FastAPI

from app.api.quality import router as quality_router
from app.api.preprocessing import router as preprocessing_router
from app.api.ocr import router as ocr_router
app = FastAPI(
    title="CheckItRight OCR Service",
    version="0.1.0",
)


app.include_router(quality_router)
app.include_router(preprocessing_router)
app.include_router(ocr_router)
@app.get("/")
def root():
    return {
        "service": "CheckItRight OCR Service",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }