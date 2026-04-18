import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const MAX_PHOTO_SIZE = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

function hasAllowedImageSignature(buffer: Buffer, type: string) {
  if (type === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (type === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    );
  }

  if (type === "image/webp") {
    return (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  return false;
}

export async function saveBarberPhoto(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Escolha uma foto para enviar.");
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error("A foto deve ter no maximo 3MB.");
  }

  const extension = ALLOWED_TYPES.get(file.type);

  if (!extension) {
    throw new Error("Envie uma imagem JPG, PNG ou WEBP.");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "barbers");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const absolutePath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!hasAllowedImageSignature(buffer, file.type)) {
    throw new Error("O arquivo enviado nao parece ser uma imagem valida.");
  }

  await writeFile(absolutePath, buffer);

  return `/uploads/barbers/${filename}`;
}

export async function deleteLocalBarberPhoto(imagePath: string | null | undefined) {
  if (!imagePath?.startsWith("/uploads/barbers/")) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", imagePath);
  const uploadDir = path.join(process.cwd(), "public", "uploads", "barbers");

  if (!absolutePath.startsWith(uploadDir)) {
    return;
  }

  await unlink(absolutePath).catch(() => undefined);
}
