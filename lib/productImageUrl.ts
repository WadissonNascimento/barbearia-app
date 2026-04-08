export function normalizeProductImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return null;
  }

  return imageUrl.startsWith("/") ? imageUrl : null;
}
