import cv2
import numpy as np

MIN_WIDTH = 800
MIN_HEIGHT = 400

CRITICAL_BLUR_SCORE = 35.0

MIN_BRIGHTNESS = 40.0
MAX_BRIGHTNESS = 220.0

MIN_QUALITY_SCORE = 65.0


def calculate_blur_score(
    image: np.ndarray,
) -> float:
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    variance = cv2.Laplacian(
        gray,
        cv2.CV_64F,
    ).var()

    return float(variance)


def calculate_brightness_score(
    image: np.ndarray,
) -> float:
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

    return float(
        np.mean(gray)
    )


def check_image_quality(
    image: np.ndarray,
) -> dict:
    height, width = image.shape[:2]

    blur_score = calculate_blur_score(
        image
    )

    brightness_score = (
        calculate_brightness_score(
            image
        )
    )

    issues: list[str] = []
    recommendations: list[str] = []

    resolution_ok = (
        width >= MIN_WIDTH
        and height >= MIN_HEIGHT
    )

    if not resolution_ok:
        issues.append(
            "Low image resolution"
        )

        recommendations.append(
            "Capture a higher-resolution image with the product label clearly visible."
        )

    resolution_score = min(
        100.0,
        min(
            width / MIN_WIDTH,
            height / MIN_HEIGHT,
        )
        * 100,
    )

    if (
        blur_score
        < CRITICAL_BLUR_SCORE
    ):
        issues.append(
            "Image appears significantly blurry"
        )

        recommendations.append(
            "Hold the camera steady and capture the label without motion blur."
        )

    blur_score_normalized = np.interp(
        blur_score,
        [
            CRITICAL_BLUR_SCORE,
            250.0,
        ],
        [
            0.0,
            100.0,
        ],
    )

    blur_score_normalized = float(
        np.clip(
            blur_score_normalized,
            0.0,
            100.0,
        )
    )

    if (
        brightness_score
        < MIN_BRIGHTNESS
    ):
        issues.append(
            "Image is too dark"
        )

        recommendations.append(
            "Move to a brighter area and avoid shadows over the label."
        )

    elif (
        brightness_score
        > MAX_BRIGHTNESS
    ):
        issues.append(
            "Image is too bright"
        )

        recommendations.append(
            "Reduce direct light and avoid overexposure on the product label."
        )

    if (
        MIN_BRIGHTNESS
        <= brightness_score
        <= MAX_BRIGHTNESS
    ):
        brightness_normalized = 100.0

    elif (
        brightness_score
        < MIN_BRIGHTNESS
    ):
        brightness_normalized = (
            brightness_score
            / MIN_BRIGHTNESS
        ) * 100.0

    else:
        brightness_normalized = max(
            0.0,
            100.0
            - (
                (
                    brightness_score
                    - MAX_BRIGHTNESS
                )
                * 2
            ),
        )

    brightness_normalized = float(
        np.clip(
            brightness_normalized,
            0.0,
            100.0,
        )
    )

    score = (
        resolution_score * 0.30
        + blur_score_normalized * 0.45
        + brightness_normalized * 0.25
    )

    score = round(
        float(
            np.clip(
                score,
                0.0,
                100.0,
            )
        ),
        2,
    )

    critical_failure = (
        blur_score
        < CRITICAL_BLUR_SCORE
        or brightness_score < 20
        or brightness_score > 245
        or (
            not resolution_ok
            and score < 60
        )
    )

    passed = (
        not critical_failure
        and score >= MIN_QUALITY_SCORE
    )

    return {
        "passed": passed,
        "score": score,
        "width": width,
        "height": height,
        "blur_score": round(
            blur_score,
            2,
        ),
        "brightness_score": round(
            brightness_score,
            2,
        ),
        "issues": issues,
        "recommendations": recommendations,
    }