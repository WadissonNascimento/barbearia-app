import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { normalizeProductImageUrl } from "@/lib/productImageUrl";

function slugifyFileName(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  const base = path
    .basename(fileName, extension)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return {
    base: base || "produto",
    extension: extension || ".png",
  };
}

export { normalizeProductImageUrl };

export async function saveProductImage(file: File) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Envie um arquivo de imagem valido.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const { base, extension } = slugifyFileName(file.name);
  const fileName = `${Date.now()}-${base}${extension}`;
  const relativeDir = path.join("uploads", "products");
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(absoluteDir, fileName), buffer);

  return `/${relativeDir.replace(/\\/g, "/")}/${fileName}`;
}
