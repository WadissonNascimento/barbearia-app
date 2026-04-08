import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

const adminSections = [
  {
    href: "/admin/barbeiros",
    title: "CRUD de Barbeiros",
    description: "Cadastrar, inativar, reativar e excluir barbeiros.",
  },
  {
    href: "/admin/agenda",
    title: "Agenda Geral",
    description: "Visualize todos os agendamentos e filtre por barbeiro e periodo.",
  },
  {
    href: "/admin/produtos",
    title: "CRUD de Produtos",
    description: "Criar, editar, ocultar e excluir produtos da loja.",
  },
  {
    href: "/admin/servicos",
    title: "Servicos Gerais",
    description: "Gerencie os servicos padrao disponiveis para todos os barbeiros.",
  },
  {
    href: "/admin/pedidos",
    title: "Pedidos da Loja",
    description: "Acompanhe pedidos, altere status e gerencie a operacao.",
  },
];

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/painel");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Painel do Admin</h1>
          <p className="text-zinc-400">Bem-vindo, {session.user.name}</p>
        </div>

        <LogoutButton />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:bg-zinc-800"
          >
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-zinc-400">
              {section.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
