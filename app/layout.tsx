import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Manrope, Space_Grotesk } from "next/font/google";
import { auth } from "@/auth";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const role =
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "BARBER" ||
    session?.user?.role === "CUSTOMER"
      ? session.user.role
      : null;
  const hideFooter = role === "ADMIN" || role === "BARBER";

  return (
    <html lang="pt-BR">
      <body
        className={`${bodyFont.variable} ${headingFont.variable} min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)]`}
      >
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header
              role={role}
              userName={session?.user?.name || null}
            />
            <main className="flex-1 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              {children}
            </main>
            {hideFooter ? null : <Footer />}
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
