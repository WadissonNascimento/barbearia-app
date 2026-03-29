import { signOut } from "@/auth";

export function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-xl border border-zinc-700 px-4 py-2 text-white transition hover:bg-zinc-800"
      >
        Sair
      </button>
    </form>
  );
}