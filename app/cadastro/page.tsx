import Link from "next/link";
import { registerAction } from "./actions";
import AuthSubmitButton from "@/components/AuthSubmitButton";

export default function CadastroPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#030712] px-4 text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom,_rgba(37,99,235,0.12),_transparent_30%)]" />

      <div className="relative w-full max-w-md">
        <div className="absolute -inset-3 rounded-[2rem] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_60%)] blur-2xl" />

        <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
              Cadastro
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Criar conta</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Cadastre-se para acessar o painel.
            </p>
          </div>

          <form action={registerAction} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-200">Nome</label>
              <input
                name="name"
                type="text"
                placeholder="Seu nome"
                className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-200">Email</label>
              <input
                name="email"
                type="email"
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-200">Senha</label>
              <input
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-200">
                Confirmar senha
              </label>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Repita sua senha"
                className="w-full rounded-2xl border border-white/10 bg-[#050816] px-4 py-4 text-white outline-none transition placeholder:text-zinc-500 focus:border-sky-400/50 focus:bg-[#07101f]"
                required
              />
            </div>

            <AuthSubmitButton
              idleText="Criar conta"
              loadingText="Criando conta..."
            />
          </form>

          <p className="mt-5 text-center text-sm text-zinc-400">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-sky-300 transition hover:text-sky-200"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}