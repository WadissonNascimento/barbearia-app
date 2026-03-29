import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function PainelPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold">PAINEL FUNCIONANDO</h1>
      <p>Bem-vindo {session.user?.name}</p>
      <p>Role: {session.user?.role}</p>
    </div>
  );
}