import Link from "next/link";
import { registerCustomerAction } from "./actions";

export default function RegisterPage() {
  async function submit(formData: FormData) {
    "use server";
    await registerCustomerAction(formData);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020b1a] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-sky-300">
            Cadastro
          </p>
          <h1 className="text-4xl font-bold">Criar conta</h1>
          <p className="mt-3 text-sm text-zinc-300">
            Crie sua conta de cliente para agendar horários.
          </p>
        </div>

        <form action={submit} className="space-y-5">
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
              className="w-full rounded-2xl border border-white/10 bg-[#243754] px-4 py-4 text-white outline-none placeholder:text-zinc-400"
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
              className="w-full rounded-2xl border border-white/10 bg-[#243754] px-4 py-4 text-white outline-none placeholder:text-zinc-400"
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
              className="w-full rounded-2xl border border-white/10 bg-[#243754] px-4 py-4 text-white outline-none placeholder:text-zinc-400"
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
              className="w-full rounded-2xl border border-white/10 bg-[#020817] px-4 py-4 text-white outline-none placeholder:text-zinc-400"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-sky-500 px-4 py-4 font-semibold text-white transition hover:bg-sky-400"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-300">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-sky-300 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
