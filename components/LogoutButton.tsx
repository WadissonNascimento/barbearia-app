"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-400 active:scale-[0.98]"
    >
      Sair
    </button>
  );
}