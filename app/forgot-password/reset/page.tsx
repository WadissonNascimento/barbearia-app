import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: {
    email?: string;
    sent?: string;
  };
}) {
  const email = String(searchParams?.email || "").trim().toLowerCase();

  if (!email) {
    redirect("/forgot-password");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020b1a] px-4 text-white">
      <ResetPasswordForm email={email} sent={searchParams?.sent === "1"} />
    </main>
  );
}
