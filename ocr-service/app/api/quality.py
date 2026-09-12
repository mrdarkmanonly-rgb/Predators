from io import BytesIO

import cv2
import numpy as np
import requests
from fastapi import APIRouter, HTTPException

from app.schemas.quality import (
    QualityCheckRequest,
    QualityCheckResponse,
)
from app.services.quality import check_image_quality


router = APIRouter(
    prefix="/quality",
    tags=["Image Quality"],
)


@router.post(
    "/check",
    response_model=QualityCheckResponse,
)
def quality_check(payload: QualityCheckRequest):
    try:
        response = requests.get(
            payload.image_url,
            timeout=15,
        )

        response.raise_for_status()

        image_bytes = np.frombuffer(
            response.content,
            dtype=np.uint8,
        )

        image = cv2.imdecode(
            image_bytes,
            cv2.IMREAD_COLOR,
        )

        if image is None:
            raise HTTPException(
                status_code=400,
                detail="Unable to decode image",
            )

        result = check_image_quality(image)

        return result

    except requests.RequestException:
        raise HTTPException(
            status_code=400,
            detail="Unable to download image",
        )

    except HTTPException:
        raise

    except Exception as error:
        print("QUALITY CHECK ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Image quality check failed",
        )