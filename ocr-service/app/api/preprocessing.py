from fastapi import APIRouter, HTTPException
import cv2
import numpy as np
import requests

from app.services.preprocessing import preprocess_image

router = APIRouter(
    prefix="/preprocess",
    tags=["Image Preprocessing"],
)


@router.post("/check")
def preprocess_check(image_url: str):
    try:
        response = requests.get(
            image_url,
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

        processed = preprocess_image(image)

        original_height, original_width = image.shape[:2]

        ocr_height, ocr_width = processed[
            "ocr_ready"
        ].shape[:2]

        return {
            "success": True,
            "original": {
                "width": original_width,
                "height": original_height,
            },
            "ocr_ready": {
                "width": ocr_width,
                "height": ocr_height,
            },
            "message": "Image preprocessing completed successfully",
        }

    except requests.RequestException:
        raise HTTPException(
            status_code=400,
            detail="Unable to download image",
        )

    except HTTPException:
        raise

    except Exception as error:
        print("PREPROCESSING ERROR:", error)

        raise HTTPException(
            status_code=500,
            detail="Image preprocessing failed",
        )

@router.post("/preview")
def preprocess_preview(image_url: str):
    try:
        response = requests.get(
            image_url,
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

        processed = preprocess_image(image)

        ocr_ready = processed["ocr_ready"]

        success, encoded_image = cv2.imencode(
            ".png",
            ocr_ready,
        )

        if not success:
            raise HTTPException(
                status_code=500,
                detail="Unable to encode processed image",
            )

        return Response(
            content=encoded_image.tobytes(),
            media_type="image/png",
        )

    except requests.RequestException:
        raise HTTPException(
            status_code=400,
            detail="Unable to download image",
        )

    except HTTPException:
        raise

    except Exception as error:
        print("PREPROCESSING PREVIEW ERROR:", repr(error))

    raise HTTPException(
        status_code=500,
        detail=str(error),
    )