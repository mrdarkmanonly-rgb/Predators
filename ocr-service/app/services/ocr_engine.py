import os

os.environ["FLAGS_use_onednn"] = "0"
os.environ["FLAGS_enable_pir_api"] = "0"

import cv2
import numpy as np

from paddleocr import PaddleOCR


class OCREngine:
    def __init__(
        self,
        lang: str = "en",
        device: str = "cpu",
    ):
        self.ocr = PaddleOCR(
            lang=lang,
            device=device,
            enable_mkldnn=False,
        )

    def process_image(
        self,
        image: np.ndarray,
    ) -> dict:

        temp_path = None

        try:
            # --------------------------------
            # Convert grayscale to BGR
            # --------------------------------

            if len(image.shape) == 2:
                image_for_ocr = cv2.cvtColor(
                    image,
                    cv2.COLOR_GRAY2BGR,
                )
            else:
                image_for_ocr = image

            # --------------------------------
            # Save processed image temporarily
            # --------------------------------

            success, encoded_image = cv2.imencode(
                ".png",
                image_for_ocr,
            )

            if not success:
                raise ValueError(
                    "Unable to encode image for OCR"
                )

            import tempfile

            with tempfile.NamedTemporaryFile(
                suffix=".png",
                delete=False,
            ) as temp_file:

                temp_file.write(
                    encoded_image.tobytes()
                )

                temp_path = temp_file.name

            # --------------------------------
            # Run PaddleOCR
            # --------------------------------

            result = self.ocr.predict(
                temp_path
            )

            # --------------------------------
            # Parse OCR result
            # --------------------------------

            detections = []

            for page in result:

                texts = page.get(
                    "rec_texts",
                    [],
                )

                scores = page.get(
                    "rec_scores",
                    [],
                )

                boxes = page.get(
                    "rec_boxes",
                    [],
                )

                for text, score, box in zip(
                    texts,
                    scores,
                    boxes,
                ):
                    detections.append(
                        {
                            "text": str(text),
                            "confidence": round(
                                float(score),
                                4,
                            ),
                            "bbox": box.tolist(),
                        }
                    )

            # --------------------------------
            # Average confidence
            # --------------------------------

            average_confidence = 0.0

            if detections:
                average_confidence = round(
                    sum(
                        item["confidence"]
                        for item in detections
                    )
                    / len(detections),
                    4,
                )

            # --------------------------------
            # Final OCR result
            # --------------------------------

            return {
                "text": "\n".join(
                    item["text"]
                    for item in detections
                ),
                "detections": detections,
                "average_confidence": (
                    average_confidence
                ),
                "detection_count": len(
                    detections
                ),
                "engine": "PaddleOCR",
                "language": "en",
            }

        finally:

            # --------------------------------
            # Delete temporary file
            # --------------------------------

            if (
                temp_path
                and os.path.exists(temp_path)
            ):
                os.remove(temp_path)


ocr_engine = OCREngine()