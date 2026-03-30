import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function RedirecionarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;

  if (role === "ADMIN") {
    redirect("/painel");
  }

  if (role === "BARBER") {
    redirect("/barber");
  }

  if (role === "CUSTOMER") {
    redirect("/customer");
  }

  redirect("/login");
}