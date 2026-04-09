import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/PageHeader";
import SectionCard from "@/components/ui/SectionCard";
import EmptyState from "@/components/ui/EmptyState";
import {
  createCouponAction,
  deleteCouponAction,
  toggleCouponAction,
  updateCouponAction,
} from "./actions";

export default async function AdminCouponsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/painel");
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 text-white">
      <PageHeader
        title="Cupons"
        description="Crie descontos promocionais para a loja e acompanhe o uso de cada codigo."
        actions={
          <Link
            href="/admin"
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
          >
            Voltar ao admin
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <SectionCard
          title="Novo cupom"
          description="Defina regra, validade e limite de uso."
        >
          <form action={createCouponAction} className="space-y-4">
            <Field label="Codigo">
              <input
                name="code"
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
              />
            </Field>

            <Field label="Descricao">
              <input
                name="description"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tipo">
                <select
                  name="discountType"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                >
                  <option value="PERCENT">Percentual</option>
                  <option value="FIXED">Valor fixo</option>
                </select>
              </Field>

              <Field label="Valor do desconto">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  name="discountValue"
                  required
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pedido minimo">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="minOrderTotal"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                />
              </Field>

              <Field label="Desconto maximo">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="maxDiscount"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Limite de usos">
                <input
                  type="number"
                  min="1"
                  step="1"
                  name="usageLimit"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                />
              </Field>

              <Field label="Valido ate">
                <input
                  type="date"
                  name="expiresAt"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                />
              </Field>
            </div>

            <button className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black">
              Criar cupom
            </button>
          </form>
        </SectionCard>

        <div className="space-y-4">
          {coupons.length === 0 ? (
            <EmptyState
              title="Nenhum cupom cadastrado"
              description="Os cupons promocionais aparecerao aqui."
            />
          ) : (
            coupons.map((coupon) => (
              <SectionCard
                key={coupon.id}
                title={coupon.code}
                description={`${coupon.discountType === "PERCENT" ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue.toFixed(2)}`} de desconto`}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                  <div>
                    <p>Usos: {coupon.timesUsed}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</p>
                    <p>Minimo: R$ {coupon.minOrderTotal.toFixed(2)}</p>
                    <p>
                      Validade:{" "}
                      {coupon.expiresAt
                        ? new Date(coupon.expiresAt).toLocaleDateString("pt-BR")
                        : "Sem validade"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form action={toggleCouponAction}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <button className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">
                        {coupon.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </form>

                    <form action={deleteCouponAction}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <button className="rounded-xl border border-red-500/40 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10">
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>

                <form action={updateCouponAction} className="grid gap-4 md:grid-cols-2">
                  <input type="hidden" name="couponId" value={coupon.id} />

                  <Field label="Descricao">
                    <input
                      name="description"
                      defaultValue={coupon.description || ""}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                    />
                  </Field>

                  <Field label="Tipo">
                    <select
                      name="discountType"
                      defaultValue={coupon.discountType}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                    >
                      <option value="PERCENT">Percentual</option>
                      <option value="FIXED">Valor fixo</option>
                    </select>
                  </Field>

                  <Field label="Valor do desconto">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      name="discountValue"
                      defaultValue={coupon.discountValue}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                    />
                  </Field>

                  <Field label="Pedido minimo">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="minOrderTotal"
                      defaultValue={coupon.minOrderTotal}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                    />
                  </Field>

                  <Field label="Desconto maximo">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="maxDiscount"
                      defaultValue={coupon.maxDiscount || ""}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                    />
                  </Field>

                  <Field label="Limite de usos">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      name="usageLimit"
                      defaultValue={coupon.usageLimit || ""}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                    />
                  </Field>

                  <Field label="Valido ate">
                    <input
                      type="date"
                      name="expiresAt"
                      defaultValue={
                        coupon.expiresAt
                          ? new Date(coupon.expiresAt).toISOString().slice(0, 10)
                          : ""
                      }
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <button className="rounded-xl bg-white px-4 py-3 font-semibold text-black">
                      Salvar alteracoes
                    </button>
                  </div>
                </form>
              </SectionCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-zinc-300">{label}</span>
      {children}
    </label>
  );
}
