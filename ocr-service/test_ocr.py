from paddleocr import PaddleOCR


IMAGE_URL = (
    "https://res.cloudinary.com/dnbggex8v/"
    "image/upload/v1789134938/lsn40ogy6wpoqmjj9r1i.png"
)


ocr = PaddleOCR(
    lang="en",
    device="cpu",
    enable_mkldnn=False,
)


result = ocr.predict(IMAGE_URL)


for page in result:
    texts = page.get("rec_texts", [])
    scores = page.get("rec_scores", [])
    boxes = page.get("rec_boxes", [])

    print("\n========== OCR RESULT ==========\n")

    for text, score, box in zip(
        texts,
        scores,
        boxes,
    ):
        print({
            "text": text,
            "confidence": round(float(score), 4),
            "bbox": box.tolist(),
        })