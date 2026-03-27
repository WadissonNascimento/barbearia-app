import { NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return new NextResponse(`
      <html><body style="background:#09090b;color:white;font-family:Arial;padding:30px;">
      <h1>Login inválido</h1>
      <p>Volte e tente novamente.</p>
      <a href="/admin/login" style="color:#34d399;">Ir para o login</a>
      </body></html>
    `, { headers: { "content-type": "text/html" }, status: 401 });
  }

  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(SESSION_COOKIE_NAME, createSessionValue(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return response;
}
