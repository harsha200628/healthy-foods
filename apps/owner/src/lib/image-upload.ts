const MAX_WIDTH = 880;
const MAX_HEIGHT = 660;
const MAX_DATA_URL_LENGTH = 450_000;

/**
 * Compresses a salad image file in-browser via HTML5 Canvas so it fits safely
 * inside Firestore's document limit without requiring external storage billing.
 */
export async function compressSaladImageFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file (JPG, PNG, or WebP).");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Image must be smaller than 12 MB.");
  }

  const bitmapUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Could not read selected image."));
      element.src = bitmapUrl;
    });

    const ratio = Math.min(1, MAX_WIDTH / img.width, MAX_HEIGHT / img.height);
    const width = Math.max(1, Math.round(img.width * ratio));
    const height = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas image processing unavailable.");
    }
    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.82;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > MAX_DATA_URL_LENGTH && quality > 0.35) {
      quality -= 0.12;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new Error("Image is still too large after compression. Choose a smaller photo.");
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(bitmapUrl);
  }
}
