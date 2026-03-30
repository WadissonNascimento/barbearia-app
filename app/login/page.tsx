import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Entrar</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Acesse sua conta para entrar no painel.
        </p>

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-300">Email</label>
            <input
              type="email"
              name="email"
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-zinc-300">Senha</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );
}