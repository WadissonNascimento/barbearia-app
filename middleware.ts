import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth?: { user?: { role?: string } } }) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

  const isAuthPage = pathname === "/login" || pathname === "/cadastro";
  const isPainelRoot = pathname === "/painel";

  if (!isLoggedIn && (pathname.startsWith("/painel") || pathname.startsWith("/admin") || pathname.startsWith("/customer") || pathname.startsWith("/barber"))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isAuthPage) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (role === "BARBER") {
      return NextResponse.redirect(new URL("/barber", req.url));
    }

    return NextResponse.redirect(new URL("/customer", req.url));
  }

  if (isLoggedIn && isPainelRoot) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    if (role === "BARBER") {
      return NextResponse.redirect(new URL("/barber", req.url));
    }

    return NextResponse.redirect(new URL("/customer", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/painel", req.url));
  }

  if (pathname.startsWith("/barber") && role !== "BARBER") {
    return NextResponse.redirect(new URL("/painel", req.url));
  }

  if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL("/painel", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/cadastro", "/painel/:path*", "/admin/:path*", "/barber/:path*", "/customer/:path*"],
};