import sharp from "sharp";

const OUTPUT_IMAGE_SIZE = 679;
const TARGET_PRODUCT_FILL = 0.94;
const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";

const OUTPUT_BACKGROUND = {
  r: 238,
  g: 242,
  b: 247,
  alpha: 1,
} as const;

export async function processProductImageBuffer(
  inputBuffer: Buffer,
  mimeType: string
) {
  const backgroundRemoved = await removeBackgroundIfConfigured(
    inputBuffer,
    mimeType
  ).catch((error) => {
    console.warn("[product-image] remove.bg falhou, seguindo com o arquivo original.", error);
    return {
      buffer: inputBuffer,
      mimeType,
      backgroundRemoved: false,
    };
  });

  const innerSize = Math.round(OUTPUT_IMAGE_SIZE * TARGET_PRODUCT_FILL);
  const foreground = await sharp(backgroundRemoved.buffer, { failOn: "none" })
    .rotate()
    .trim()
    .resize(innerSize, innerSize, {
      fit: "inside",
      withoutEnlargement: false,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const outputBuffer = await sharp({
    create: {
      width: OUTPUT_IMAGE_SIZE,
      height: OUTPUT_IMAGE_SIZE,
      channels: 4,
      background: OUTPUT_BACKGROUND,
    },
  })
    .composite([{ input: foreground, gravity: "center" }])
    .webp({ quality: 86 })
    .toBuffer();

  return {
    buffer: outputBuffer,
    mimeType: "image/webp",
    extension: "webp",
    size: OUTPUT_IMAGE_SIZE,
    backgroundRemoved: backgroundRemoved.backgroundRemoved,
  };
}

async function removeBackgroundIfConfigured(
  inputBuffer: Buffer,
  mimeType: string
) {
  const apiKey = process.env.REMOVE_BG_API_KEY?.trim();

  if (!apiKey) {
    return {
      buffer: inputBuffer,
      mimeType,
      backgroundRemoved: false,
    };
  }

  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("crop", "true");
  formData.append("format", "png");
  formData.append(
    "image_file",
    new Blob([inputBuffer], { type: mimeType }),
    "product-image"
  );

  const response = await fetch(REMOVE_BG_ENDPOINT, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`remove.bg ${response.status}: ${message}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    mimeType: "image/png",
    backgroundRemoved: true,
  };
}
