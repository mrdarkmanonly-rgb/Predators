from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

import cv2
import numpy as np
import requests
import time

from app.services.quality import check_image_quality
from app.services.preprocessing import (
    preprocess_image,
    image_to_data_url,
)
from app.services.ocr_engine import ocr_engine
from app.services.field_extraction import extract_fields
from app.services.rule_engine import evaluate_compliance

router = APIRouter(
    prefix="/ocr",
    tags=["OCR"],
)

class MultiImageOCRRequest(BaseModel):
    image_urls: list[str]

def download_image(
    image_url: str,
) -> np.ndarray:
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
        raise ValueError(
            "Unable to decode image"
        )

    return image

def create_preprocessing_variants(
    processed: dict,
) -> dict:
    variant_sources = {
        "grayscale": processed.get(
            "grayscale"
        ),
        "contrast_enhanced": processed.get(
            "enhanced"
        ),
        "denoised": processed.get(
            "denoised"
        ),
        "sharpened": processed.get(
            "ocr_ready"
        ),
        "thresholded": processed.get(
            "thresholded"
        ),
    }

    variants = {}

    for name, image in variant_sources.items():
        if image is None:
            continue

        variants[name] = image_to_data_url(
            image
        )

    return variants

@router.post("/extract")
def extract_text(
    request: MultiImageOCRRequest,
):
    if not request.image_urls:
        raise HTTPException(
            status_code=400,
            detail="At least one image URL is required",
        )

    if len(request.image_urls) > 6:
        raise HTTPException(
            status_code=400,
            detail="Maximum 6 images are allowed per scan",
        )

    pipeline_start = time.perf_counter()

    try:
        all_detections = []
        image_results = []

        for index, image_url in enumerate(
            request.image_urls,
            start=1,
        ):
            image_start = time.perf_counter()

            print(
                f"\n========== IMAGE {index} =========="
            )

            print(
                f"OCR: Downloading image {index}"
            )

            download_start = time.perf_counter()

            image = download_image(
                image_url
            )

            download_time = (
                time.perf_counter()
                - download_start
            )

            print(
                "OCR: Image downloaded:",
                image.shape,
            )

            print(
                f"⏱ Download time: "
                f"{download_time:.2f}s"
            )

            print(
                f"OCR: Checking quality for image {index}"
            )

            quality_start = time.perf_counter()

            quality = check_image_quality(
                image
            )

            quality_time = (
                time.perf_counter()
                - quality_start
            )

            print(
                "OCR: Quality score:",
                quality["score"],
            )

            print(
                f"⏱ Quality check time: "
                f"{quality_time:.2f}s"
            )

            if not quality["passed"]:
                print(
                    f"OCR: Image {index} "
                    f"failed quality check"
                )

                image_total_time = (
                    time.perf_counter()
                    - image_start
                )

                print(
                    f"⏱ IMAGE {index} TOTAL TIME: "
                    f"{image_total_time:.2f}s"
                )

                image_results.append(
                    {
                        "image_index": index,
                        "image_url": image_url,
                        "success": False,
                        "stage": "quality_check",
                        "quality": quality,
                        "ocr": None,
                        "preprocessing": None,
                        "ocr_variant_used": None,
                    }
                )

                continue

            print(
                f"OCR: Preprocessing image {index}"
            )

            preprocess_start = time.perf_counter()

            processed = preprocess_image(
                image
            )

            preprocess_time = (
                time.perf_counter()
                - preprocess_start
            )

            preprocessing_variants = (
                create_preprocessing_variants(
                    processed
                )
            )

            ocr_ready_image = processed[
                "ocr_ready"
            ]

            print(
                "OCR: OCR-ready image:",
                ocr_ready_image.shape,
            )

            print(
                f"⏱ Preprocessing time: "
                f"{preprocess_time:.2f}s"
            )

            print(
                f"OCR: Running PaddleOCR "
                f"on image {index}"
            )

            ocr_start = time.perf_counter()

            ocr_result = ocr_engine.process_image(
                ocr_ready_image
            )

            ocr_time = (
                time.perf_counter()
                - ocr_start
            )

            print(
                f"OCR: Image {index} "
                f"extraction completed"
            )

            print(
                f"🔥 PaddleOCR time: "
                f"{ocr_time:.2f}s"
            )

            image_detections = (
                ocr_result["detections"]
            )

            all_detections.extend(
                image_detections
            )

            image_results.append(
                {
                    "image_index": index,
                    "image_url": image_url,
                    "success": True,
                    "stage": "completed",
                    "quality": quality,
                    "preprocessing": {
                        "variants": preprocessing_variants,
                        "variant_names": list(
                            preprocessing_variants.keys()
                        ),
                        "ocr_variant_used": "sharpened",
                    },
                    "ocr": ocr_result,
                }
            )

            image_total_time = (
                time.perf_counter()
                - image_start
            )

            print(
                f"⏱ IMAGE {index} TOTAL TIME: "
                f"{image_total_time:.2f}s"
            )

        successful_images = [
            result
            for result in image_results
            if result["success"]
        ]

        if not successful_images:
            pipeline_time = (
                time.perf_counter()
                - pipeline_start
            )

            print(
                f"\n⏱ TOTAL PIPELINE TIME: "
                f"{pipeline_time:.2f}s"
            )

            return {
                "success": False,
                "stage": "quality_check",
                "message": (
                    "None of the uploaded images "
                    "passed the quality check."
                ),
                "images": image_results,
                "extracted_fields": None,
                "compliance": None,
            }

        print(
            "\n========== FIELD EXTRACTION =========="
        )

        print(
            "OCR: Total detections:",
            len(all_detections),
        )

        field_start = time.perf_counter()

        extracted_fields = extract_fields(
            all_detections
        )

        field_time = (
            time.perf_counter()
            - field_start
        )

        print(
            "OCR: Field extraction completed"
        )

        print(
            f"⏱ Field extraction time: "
            f"{field_time:.2f}s"
        )

        print(
            "\n========== RULE ENGINE =========="
        )

        rule_start = time.perf_counter()

        compliance_result = evaluate_compliance(
            extracted_fields
        )

        rule_time = (
            time.perf_counter()
            - rule_start
        )

        print(
            "OCR: Compliance evaluation completed"
        )

        print(
            f"⏱ Rule engine time: "
            f"{rule_time:.2f}s"
        )

        print(
            "Overall status:",
            compliance_result["overall_status"],
        )

        print(
            "Compliance score:",
            compliance_result["compliance_score"],
        )

        print(
            "Rules passed:",
            compliance_result["summary"]["passed"],
        )

        print(
            "Rules failed:",
            compliance_result["summary"]["failed"],
        )

        print(
            "Rules not verifiable:",
            compliance_result["summary"][
                "not_verifiable"
            ],
        )

        pipeline_time = (
            time.perf_counter()
            - pipeline_start
        )

        print(
            f"\n⏱ TOTAL OCR PIPELINE TIME: "
            f"{pipeline_time:.2f}s"
        )

        return {
            "success": True,
            "stage": "completed",
            "summary": {
                "total_images": len(
                    request.image_urls
                ),
                "successful_images": len(
                    successful_images
                ),
                "failed_images": (
                    len(request.image_urls)
                    - len(successful_images)
                ),
                "total_detections": len(
                    all_detections
                ),
            },
            "images": image_results,
            "ocr": {
                "text": "\n".join(
                    detection["text"]
                    for detection in all_detections
                ),
                "detections": all_detections,
                "detection_count": len(
                    all_detections
                ),
                "average_confidence": (
                    round(
                        sum(
                            detection["confidence"]
                            for detection in all_detections
                        )
                        / len(all_detections),
                        4,
                    )
                    if all_detections
                    else 0.0
                ),
                "engine": "PaddleOCR",
                "language": "en",
            },
            "extracted_fields": extracted_fields,
            "compliance": compliance_result,
        }

    except requests.RequestException as error:
        print(
            "OCR DOWNLOAD ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=400,
            detail=(
                f"Image download failed: "
                f"{str(error)}"
            ),
        )

    except Exception as error:
        import traceback

        print(
            "OCR PIPELINE ERROR:",
            repr(error),
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail={
                "error": str(error),
                "type": type(error).__name__,
            },
        )