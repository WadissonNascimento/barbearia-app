export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/barber/:path*", "/customer/:path*", "/painel/:path*"],
};