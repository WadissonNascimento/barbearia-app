"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { registerCustomerAction } from "@/app/register/actions";
import FeedbackMessage from "@/components/FeedbackMessage";
import SubmitButton from "@/components/SubmitButton";
import { initialFormFeedbackState } from "@/lib/formFeedbackState";

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition focus:border-[var(--brand)]/50 focus:ring-2 focus:ring-[var(--brand)]/20 placeholder:text-zinc-400";

const passwordInputClassName =
  "w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-white outline-none transition focus:border-[var(--brand)]/50 focus:ring-2 focus:ring-[var(--brand)]/20 placeholder:text-zinc-400";

export default function RegisterForm() {
  const [state, formAction] = useFormState(
    registerCustomerAction,
    initialFormFeedbackState
  );

  return (
    <div className="surface-card-strong w-full max-w-md rounded-[32px] p-6 shadow-2xl sm:p-8">
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[var(--brand-strong)]">
          Cadastro
        </p>
        <h1 className="text-4xl font-bold">Criar conta</h1>
        <p className="mt-3 text-sm text-zinc-300">
          Crie sua conta de cliente para agendar. Antes de finalizar, voce confirma um codigo enviado por e-mail.
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        <FeedbackMessage message={state.error} tone="error" />

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Nome
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={inputClassName}
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClassName}
            placeholder="seuemail@exemplo.com"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            className={inputClassName}
            placeholder="Opcional"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-zinc-200"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={passwordInputClassName}
            placeholder="Minimo 6 caracteres"
          />
        </div>

        <SubmitButton idleText="Criar conta" loadingText="Criando conta..." />
      </form>

      <p className="mt-6 text-center text-sm text-zinc-300">
        Ja tem conta?{" "}
        <Link href="/login" className="font-semibold text-[var(--brand-strong)] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
