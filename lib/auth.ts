import crypto from "crypto";

const COOKIE_NAME = "barber_admin_session";

function sign(value: string) {
  const secret = process.env.AUTH_SECRET || "dev-secret";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function createSessionValue(email: string) {
  const payload = `${email}.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string) {
  const parts = value.split(".");
  if (parts.length < 3) return false;
  const signature = parts.pop() as string;
  const payload = parts.join(".");
  return sign(payload) === signature;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
