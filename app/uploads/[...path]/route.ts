import { readFile, stat } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

type UploadRouteParams = {
  path?: string[];
};

function getUploadFilePath(parts: string[] = []) {
  const requestedPath = path.join(UPLOADS_DIR, ...parts);
  const relativePath = path.relative(UPLOADS_DIR, requestedPath);

  if (
    !parts.length ||
    relativePath.startsWith("..") ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  return requestedPath;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<UploadRouteParams> }
) {
  const { path: uploadPath = [] } = await params;
  const filePath = getUploadFilePath(uploadPath);

  if (!filePath) {
    return NextResponse.json({ message: "Arquivo invalido." }, { status: 400 });
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return NextResponse.json({ message: "Arquivo nao encontrado." }, { status: 404 });
    }

    const file = await readFile(filePath);
    const contentType =
      CONTENT_TYPES[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream";

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json({ message: "Arquivo nao encontrado." }, { status: 404 });
  }
}
