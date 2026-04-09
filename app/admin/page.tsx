import {
  CalendarRange,
  Coins,
  PackageSearch,
  PercentCircle,
  Scissors,
  ShoppingBag,
  UsersRound,
} from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import DashboardEntryCard from "@/components/ui/DashboardEntryCard";
import { LogoutButton } from "@/components/LogoutButton";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/painel");
  }

  const [activeBarbers, pendingOrders, activeProducts, openPayouts] = await Promise.all([
    prisma.user.count({
      where: {
        role: "BARBER",
        isActive: true,
      },
    }),
    prisma.order.count({
      where: {
        status: {
          in: ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "READY_FOR_PICKUP"],
        },
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
      },
    }),
    prisma.barberPayout.count({
      where: {
        status: {
          in: ["OPEN", "CLOSED"],
        },
      },
    }),
  ]);

  const entries = [
    {
      href: "/admin/barbeiros",
      icon: UsersRound,
      title: "Barbeiros",
      description: "Convites, ativacao, desligamento e historico operacional da equipe.",
      badge: activeBarbers ? `${activeBarbers}` : undefined,
    },
    {
      href: "/admin/agenda",
      icon: CalendarRange,
      title: "Agenda geral",
      description: "Veja todos os agendamentos e acompanhe a operacao da casa.",
    },
    {
      href: "/admin/servicos",
      icon: Scissors,
      title: "Servicos",
      description: "Gerencie servicos padrao, precos, duracao e comissoes administradas.",
    },
    {
      href: "/admin/produtos",
      icon: PackageSearch,
      title: "Produtos",
      description: "Organize o catalogo da loja, estoque e itens ativos para venda.",
      badge: activeProducts ? `${activeProducts}` : undefined,
    },
    {
      href: "/admin/pedidos",
      icon: ShoppingBag,
      title: "Pedidos",
      description: "Acompanhe status, aprovacao, separacao e rastreio dos pedidos.",
      badge: pendingOrders ? `${pendingOrders}` : undefined,
    },
    {
      href: "/admin/cupons",
      icon: PercentCircle,
      title: "Cupons",
      description: "Crie campanhas e regras promocionais para a loja da barbearia.",
    },
    {
      href: "/admin/financeiro",
      icon: Coins,
      title: "Financeiro",
      description: "Abra o painel de faturamento, comparativos, repasses e fechamentos.",
      badge: openPayouts ? `${openPayouts}` : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#18233b_0%,#0b0e16_45%,#06070b_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-10 text-white">
        <PageHeader
          eyebrow="Painel Admin"
          title="Central administrativa"
          description="Escolha uma area e abra direto a pagina completa daquela funcao, sem modulos aninhados no celular."
          actions={<LogoutButton />}
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
