"use client";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1200;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function validateProductImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Envie uma imagem JPG, PNG ou WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("A imagem deve ter no maximo 2MB.");
  }
}

function getTargetSize(width: number, height: number) {
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.82);
  });
}

export async function prepareProductImageUpload(file: File) {
  validateProductImage(file);

  const bitmap = await createImageBitmap(file);
  const target = getTargetSize(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return {
      file,
      previewUrl: URL.createObjectURL(file),
    };
  }

  context.drawImage(bitmap, 0, 0, target.width, target.height);
  bitmap.close();

  const blob = await canvasToBlob(canvas);
  const uploadFile =
    blob && blob.size <= MAX_IMAGE_SIZE
      ? new File([blob], "image.webp", { type: "image/webp" })
      : file;

  if (uploadFile.size > MAX_IMAGE_SIZE) {
    throw new Error("A imagem comprimida ainda ficou acima de 2MB.");
  }

  return {
    file: uploadFile,
    previewUrl: URL.createObjectURL(uploadFile),
  };
}

