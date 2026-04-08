"use client";

export default function AuthFormMessage({
  message,
}: {
  message: string | null;
}) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
    </div>
  );
}
