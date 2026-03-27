export default function SucessoPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-white">Pagamento iniciado</h1>
      <p className="mt-4 text-zinc-300">
        Quando o Mercado Pago confirmar o pagamento, o pedido será atualizado automaticamente pelo webhook.
      </p>
    </section>
  );
}
