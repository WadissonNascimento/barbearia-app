export default function AdminLoginPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <form method="POST" action="/api/admin/login" className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-3xl font-bold text-white">Login do barbeiro</h1>
        <p className="mt-2 text-zinc-400">Use o e-mail e a senha definidos no arquivo .env</p>
        <div className="mt-6 space-y-4">
          <input name="email" type="email" placeholder="E-mail" className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required />
          <input name="password" type="password" placeholder="Senha" className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-white outline-none" required />
        </div>
        <button className="mt-5 w-full rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-black">Entrar</button>
      </form>
    </section>
  );
}
