import { loginAction } from "./actions";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Entrar</h1>

        <form action={loginAction} className="mt-6 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            className="w-full rounded-xl bg-black px-4 py-3 text-white"
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Senha"
            className="w-full rounded-xl bg-black px-4 py-3 text-white"
            required
          />

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-3 font-bold text-black"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}