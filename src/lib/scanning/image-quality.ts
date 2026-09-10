import type { ImageQualityResult } from "./types";

const MIN_WIDTH = 900;
const MIN_HEIGHT = 600;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function checkImageQuality(
  file: File,
): Promise<ImageQualityResult> {
  const reasons: string[] = [];

  if (!file.type.startsWith("image/")) {
    return {
      status: "POOR",
      width: 0,
      height: 0,
      reasons: ["The selected file is not a supported image."],
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    reasons.push("Image is larger than 10 MB.");
  }

  const dimensions = await getImageDimensions(file);

  if (!dimensions) {
    return {
      status: "NEEDS_REVIEW",
      width: 0,
      height: 0,
      reasons: ["Unable to read image dimensions."],
    };
  }

  const { width, height } = dimensions;

  if (width < MIN_WIDTH || height < MIN_HEIGHT) {
    reasons.push(
      `Image resolution is ${width} × ${height}. A larger image is recommended.`,
    );
  }

  if (reasons.length === 0) {
    return {
      status: "GOOD",
      width,
      height,
      reasons: [],
    };
  }

  return {
    status: "NEEDS_REVIEW",
    width,
    height,
    reasons,
  };
}

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      const dimensions = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      URL.revokeObjectURL(objectUrl);
      resolve(dimensions);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };

    image.src = objectUrl;
  });
}