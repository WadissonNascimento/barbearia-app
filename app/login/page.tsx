import LoginForm from "@/components/LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: {
    registered?: string;
    reset?: string;
  };
}) {
  const successMessage =
    searchParams?.registered === "1"
      ? "Conta criada com sucesso. Entre para acessar seu painel."
      : searchParams?.reset === "1"
      ? "Senha atualizada com sucesso. Entre com sua nova senha."
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 text-white">
      <LoginForm successMessage={successMessage} />
    </main>
  );
}
