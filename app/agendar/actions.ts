"use server";

export async function criarAgendamento(formData: FormData) {
  const nome = String(formData.get("nome") || "");
  const whatsapp = String(formData.get("whatsapp") || "");
  const email = String(formData.get("email") || "");
  const servico = String(formData.get("servico") || "");
  const barbeiro = String(formData.get("barbeiro") || "");
  const data = String(formData.get("data") || "");
  const horario = String(formData.get("horario") || "");
  const observacoes = String(formData.get("observacoes") || "");

  console.log({
    nome,
    whatsapp,
    email,
    servico,
    barbeiro,
    data,
    horario,
    observacoes,
  });
}