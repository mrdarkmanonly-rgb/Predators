import cv2
import numpy as np
import base64

def resize_image(
    image: np.ndarray,
    max_width: int = 1800,
) -> np.ndarray:
    height, width = image.shape[:2]

    if width <= max_width:
        return image

    scale = max_width / width
    new_width = int(width * scale)
    new_height = int(height * scale)

    resized = cv2.resize(
        image,
        (new_width, new_height),
        interpolation=cv2.INTER_AREA,
    )

    return resized

def convert_to_grayscale(
    image: np.ndarray,
) -> np.ndarray:
    return cv2.cvtColor(
        image,
        cv2.COLOR_BGR2GRAY,
    )

def improve_contrast(
    gray_image: np.ndarray,
) -> np.ndarray:
    clahe = cv2.createCLAHE(
        clipLimit=2.0,
        tileGridSize=(8, 8),
    )

    enhanced = clahe.apply(
        gray_image
    )

    return enhanced

def reduce_noise(
    gray_image: np.ndarray,
) -> np.ndarray:
    denoised = cv2.fastNlMeansDenoising(
        gray_image,
        None,
        h=10,
        templateWindowSize=7,
        searchWindowSize=21,
    )

    return denoised

def sharpen_image(
    gray_image: np.ndarray,
) -> np.ndarray:
    kernel = np.array(
        [
            [0, -1, 0],
            [-1, 5, -1],
            [0, -1, 0],
        ],
        dtype=np.float32,
    )

    sharpened = cv2.filter2D(
        gray_image,
        -1,
        kernel,
    )

    return sharpened

def adaptive_threshold(
    gray_image: np.ndarray,
) -> np.ndarray:
    return cv2.adaptiveThreshold(
        gray_image,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )

def create_ocr_variants(
    image: np.ndarray,
) -> dict:
    resized = resize_image(image)

    gray = convert_to_grayscale(
        resized
    )

    enhanced = improve_contrast(
        gray
    )

    denoised = reduce_noise(
        enhanced
    )

    sharpened = sharpen_image(
        denoised
    )

    thresholded = adaptive_threshold(
        enhanced
    )

    return {
        "grayscale": gray,
        "contrast_enhanced": enhanced,
        "denoised": denoised,
        "sharpened": sharpened,
        "thresholded": thresholded,
    }

def create_ocr_image(
    image: np.ndarray,
) -> np.ndarray:
    image = resize_image(
        image
    )

    gray = convert_to_grayscale(
        image
    )

    enhanced = improve_contrast(
        gray
    )

    denoised = reduce_noise(
        enhanced
    )

    sharpened = sharpen_image(
        denoised
    )

    return sharpened

def preprocess_image(
    image: np.ndarray,
) -> dict:
    resized = resize_image(
        image
    )

    gray = convert_to_grayscale(
        resized
    )

    enhanced = improve_contrast(
        gray
    )

    denoised = reduce_noise(
        enhanced
    )

    sharpened = sharpen_image(
        denoised
    )

    thresholded = adaptive_threshold(
        enhanced
    )

    return {
        "original": image,
        "resized": resized,
        "grayscale": gray,
        "enhanced": enhanced,
        "denoised": denoised,
        "ocr_ready": sharpened,
        "thresholded": thresholded,
    }

def image_to_data_url(
    image: np.ndarray,
) -> str:
    if len(image.shape) == 2:
        image = cv2.cvtColor(
            image,
            cv2.COLOR_GRAY2BGR,
        )

    success, encoded = cv2.imencode(
        ".jpg",
        image,
        [
            cv2.IMWRITE_JPEG_QUALITY,
            75,
        ],
    )

    if not success:
        raise ValueError(
            "Unable to encode preprocessing image"
        )

    encoded_base64 = base64.b64encode(
        encoded.tobytes()
    ).decode("utf-8")

    return (
        "data:image/jpeg;base64,"
        + encoded_base64
    )

def create_preprocessing_variants_for_response(
    processed: dict,
) -> dict:
    variants = {}

    variant_map = {
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

    for name, image in variant_map.items():
        if image is None:
            continue

        variants[name] = image_to_data_url(
            image
        )

    return variants