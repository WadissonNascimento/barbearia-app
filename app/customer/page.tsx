import {
  CalendarDays,
  KeyRound,
  Package,
  SearchCheck,
  UserRound,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DashboardEntryCard from "@/components/ui/DashboardEntryCard";
import { LogoutButton } from "@/components/LogoutButton";

export default async function CustomerPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const [appointmentsCount, ordersCount] = await Promise.all([
    prisma.appointment.count({
      where: {
        customerId: session.user.id,
      },
    }),
    prisma.order.count({
      where: {
        customerId: session.user.id,
      },
    }),
  ]);

  const entries = [
    {
      href: "/customer/agendamentos",
      icon: CalendarDays,
      title: "Meus agendamentos",
      description: "Acompanhe seus horarios marcados, veja barbeiro, servicos e status do atendimento.",
      badge: appointmentsCount ? `${appointmentsCount}` : undefined,
    },
    {
      href: "/meu-perfil",
      icon: UserRound,
      title: "Meu cadastro",
      description: "Edite seus dados, preferencias, barbeiro favorito e historico pessoal.",
    },
    {
      href: "/forgot-password",
      icon: KeyRound,
      title: "Trocar senha",
      description: "Use a recuperacao por e-mail para redefinir sua senha com seguranca.",
    },
    {
      href: "/meus-pedidos",
      icon: Package,
      title: "Meus pedidos",
      description: "Veja compras recentes, itens do pedido, status e detalhes da entrega.",
      badge: ordersCount ? `${ordersCount}` : undefined,
    },
    {
      href: "/rastreio",
      icon: SearchCheck,
      title: "Rastreio",
      description: "Abra a area de acompanhamento para consultar o andamento da entrega.",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#18233b_0%,#0b0e16_45%,#06070b_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 text-white">
        <PageHeader
          eyebrow="Minha Conta"
          title="Painel do cliente"
          description="Escolha uma opcao para abrir a pagina completa daquela funcao. No celular, cada card leva direto para o conteudo certo."
          actions={
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/65 px-4 py-3 text-right">
                <p className="text-sm text-zinc-400">Logado como</p>
                <p className="font-medium text-white">{session.user.name || "Cliente"}</p>
              </div>
              <LogoutButton />
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <DashboardEntryCard
              key={entry.href}
              href={entry.href}
              icon={entry.icon}
              title={entry.title}
              description={entry.description}
              badge={entry.badge}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
