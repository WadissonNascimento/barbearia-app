import nodemailer from "nodemailer";

function getMailConfig() {
  const host = process.env.EMAIL_SERVER_HOST;
  const port = Number(process.env.EMAIL_SERVER_PORT || "587");
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASS;
  const from = process.env.EMAIL_FROM || user;

  if (!host || !user || !pass || !from) {
    throw new Error("Configuracao de e-mail incompleta.");
  }

  return {
    host,
    port,
    user,
    pass,
    from,
  };
}

export async function sendVerificationCodeEmail({
  to,
  name,
  code,
  verifyUrl,
  accountLabel = "cadastro",
}: {
  to: string;
  name: string;
  code: string;
  verifyUrl?: string;
  accountLabel?: string;
}) {
  const config = getMailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Codigo de verificacao - Jak Barber",
    text: `Ola, ${name}.\n\nSeu codigo de verificacao para ${accountLabel} e: ${code}\n\nEsse codigo expira em 10 minutos.${verifyUrl ? `\n\nVoce tambem pode abrir: ${verifyUrl}` : ""}\n\nSe voce nao solicitou essa verificacao, ignore esta mensagem.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Jak Barber</h2>
        <p>Ola, ${name}.</p>
        <p>Seu codigo de verificacao para ${accountLabel} e:</p>
        <div style="display:inline-block;padding:12px 18px;border-radius:12px;background:#0f172a;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:6px;">
          ${code}
        </div>
        <p style="margin-top:16px;">Esse codigo expira em 10 minutos.</p>
        ${
          verifyUrl
            ? `<p><a href="${verifyUrl}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;">Abrir tela de verificacao</a></p>`
            : ""
        }
        <p>Se voce nao solicitou esse cadastro, ignore esta mensagem.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetCodeEmail({
  to,
  name,
  code,
}: {
  to: string;
  name: string;
  code: string;
}) {
  const config = getMailConfig();

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Recuperacao de senha - Jak Barber",
    text: `Ola, ${name}.\n\nSeu codigo para redefinir a senha e: ${code}\n\nEsse codigo expira em 10 minutos.\n\nSe voce nao solicitou a redefinicao, ignore esta mensagem.`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Jak Barber</h2>
        <p>Ola, ${name}.</p>
        <p>Seu codigo para redefinir a senha e:</p>
        <div style="display:inline-block;padding:12px 18px;border-radius:12px;background:#0f172a;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:6px;">
          ${code}
        </div>
        <p style="margin-top:16px;">Esse codigo expira em 10 minutos.</p>
        <p>Se voce nao solicitou a redefinicao, ignore esta mensagem.</p>
      </div>
    `,
  });
}
