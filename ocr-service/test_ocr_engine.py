import cv2
import requests
import numpy as np

from app.services.ocr_engine import ocr_engine


IMAGE_URL = (
    "https://res.cloudinary.com/dnbggex8v/"
    "image/upload/v1789134938/lsn40ogy6wpoqmjj9r1i.png"
)


def download_image(image_url: str) -> np.ndarray:
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
        raise ValueError("Unable to decode image")

    return image


image = download_image(IMAGE_URL)

result = ocr_engine.process_image(image)


print("\n========== OCR ENGINE RESULT ==========\n")

print("Engine:", result["engine"])
print("Language:", result["language"])
print("Detection Count:", result["detection_count"])
print("Average Confidence:", result["average_confidence"])

print("\n---------- Detected Text ----------\n")

for detection in result["detections"]:
    print(
        f"Text: {detection['text']}"
    )
    print(
        f"Confidence: {detection['confidence']}"
    )
    print(
        f"BBox: {detection['bbox']}"
    )
    print()