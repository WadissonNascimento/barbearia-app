"use client";

import { useFormStatus } from "react-dom";

type Props = {
  idleText: string;
  loadingText: string;
};

export default function AuthSubmitButton({
  idleText,
  loadingText,
}: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-sky-500 px-6 py-4 font-semibold text-white shadow-[0_12px_30px_rgba(14,165,233,0.35)] transition hover:bg-sky-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? loadingText : idleText}
    </button>
  );
}