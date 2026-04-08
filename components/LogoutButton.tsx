"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-xl border border-red-700 px-4 py-2 text-sm text-red-400 transition hover:bg-red-700/10"
    >
      Sair
    </button>
  );
}