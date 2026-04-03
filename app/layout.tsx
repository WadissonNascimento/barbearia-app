import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Jak Barber",
  description: "Sistema de barbearia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#030712] text-white">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}