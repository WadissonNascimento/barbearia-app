"use client";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button onClick={logout} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white">
      Sair
    </button>
  );
}
