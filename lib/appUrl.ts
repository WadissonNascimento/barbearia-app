const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getConfiguredAppUrl() {
  return trimTrailingSlash(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.AUTH_URL ||
      "http://localhost:3000"
  );
}

export function getRequestAwareAppUrl(requestUrl: string) {
  const requestOrigin = new URL(requestUrl).origin;

  if (process.env.NODE_ENV !== "production") {
    return trimTrailingSlash(requestOrigin);
  }

  const configuredUrl = getConfiguredAppUrl();

  if (configuredUrl && !LOCALHOST_PATTERN.test(configuredUrl)) {
    return configuredUrl;
  }

  return trimTrailingSlash(requestOrigin);
}
