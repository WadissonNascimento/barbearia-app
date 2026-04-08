"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import AuthFormMessage from "@/components/AuthFormMessage";
import { loginAction } from "@/app/login/actions";
import { initialLoginFormState } from "@/lib/loginFormState";

export default function LoginForm() {
  const [state, formAction] = useFormState(
    loginAction,
    initialLoginFormState
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
    >
      <div className="mb-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.35em] text-sky-300">
          Login
        </p>
        <h1 className="text-4xl font-bold">Entrar</h1>
        <p className="mt-3 text-sm text-zinc-300">
          Acesse sua conta para entrar no painel.
        </p>
      </div>

      <AuthFormMessage message={state.error} />

      <div className="space-y-5">
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
            className="w-full rounded-2xl border border-white/10 bg-[#243754] px-4 py-4 text-white outline-none placeholder:text-zinc-400"
            placeholder="seuemail@exemplo.com"
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
            className="w-full rounded-2xl border border-white/10 bg-[#020817] px-4 py-4 text-white outline-none placeholder:text-zinc-400"
            placeholder="Digite sua senha"
          />
        </div>

        <AuthSubmitButton idleText="Entrar" loadingText="Entrando..." />
      </div>

      <p className="mt-6 text-center text-sm text-zinc-300">
        Ainda nao tem conta?{" "}
        <Link
          href="/register"
          className="font-semibold text-sky-300 hover:underline"
        >
          Criar conta
        </Link>
      </p>
    </form>
  );
}
