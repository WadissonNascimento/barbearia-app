import { headers } from "next/headers";
import { NextResponse } from "next/server";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type SecurityEventDetails = Record<
  string,
  string | number | boolean | null | undefined
>;

const buckets = new Map<string, RateLimitBucket>();

function sanitizeLogDetails(details: SecurityEventDetails = {}) {
  return Object.fromEntries(
    Object.entries(details).map(([key, value]) => [
      key,
      typeof value === "string" ? value.slice(0, 120) : value,
    ])
  );
}

export function logSecurityEvent(
  event: string,
  details: SecurityEventDetails = {}
) {
  console.warn(
    `[security] ${event}`,
    JSON.stringify({
      at: new Date().toISOString(),
      ...sanitizeLogDetails(details),
    })
  );
}

export function getClientIp(headerList: Headers) {
  const forwardedFor = headerList.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    headerList.get("cf-connecting-ip") ||
    headerList.get("x-real-ip") ||
    forwardedIp ||
    "unknown"
  );
}

function cleanupExpiredBuckets(now: number) {
  if (buckets.size < 1000) {
    return;
  }

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export async function checkRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  cleanupExpiredBuckets(now);

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      resetAt: now + windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

export async function enforceRateLimit({
  scope,
  identifier,
  limit,
  windowMs,
}: {
  scope: string;
  identifier?: string;
  limit: number;
  windowMs: number;
}) {
  const headerList = headers();
  const ip = getClientIp(headerList);
  const safeIdentifier = (identifier || "anonymous").trim().toLowerCase();
  const key = `${scope}:${ip}:${safeIdentifier}`;
  const result = await checkRateLimit({ key, limit, windowMs });

  if (!result.allowed) {
    logSecurityEvent("rate_limit", {
      scope,
      ip,
      identifier: safeIdentifier,
      resetAt: new Date(result.resetAt).toISOString(),
    });
  }

  return result;
}

export async function readJsonWithLimit<T = unknown>(
  request: Request,
  maxBytes = 16 * 1024
): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  const text = await request.text();

  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  return JSON.parse(text) as T;
}

export function rateLimitResponse(message = "Muitas tentativas. Tente novamente em instantes.") {
  return NextResponse.json({ message }, { status: 429 });
}

