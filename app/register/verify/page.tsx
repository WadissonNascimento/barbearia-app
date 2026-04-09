import { redirect } from "next/navigation";
import RegisterVerifyForm from "@/components/RegisterVerifyForm";

export default function RegisterVerifyPage({
  searchParams,
}: {
  searchParams?: {
    email?: string;
    sent?: string;
  };
}) {
  const email = String(searchParams?.email || "").trim().toLowerCase();

  if (!email) {
    redirect("/register");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020b1a] px-4 text-white">
      <RegisterVerifyForm email={email} sent={searchParams?.sent === "1"} />
    </main>
  );
}
