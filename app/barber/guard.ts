import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function requireActiveBarber() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "BARBER") {
    redirect("/painel");
  }

  const activeBarber = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      role: "BARBER",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!activeBarber) {
    redirect("/login");
  }

  return {
    session,
    barber: activeBarber,
  };
}
