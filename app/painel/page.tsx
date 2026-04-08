import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PainelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "BARBER") {
    redirect("/barber");
  }

  redirect("/customer");
}