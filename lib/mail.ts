import nodemailer from "nodemailer";
import path from "path";

const LOGO_CID = "jak-barber-logo";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatFromAddress(from: string) {
  return from.includes("<") ? from : `Jak Barber <${from}>`;
}

function getLogoAttachment() {
  return {
    filename: "logo.png",
    path: path.join(process.cwd(), "public", "logo.png"),
    cid: LOGO_CID,
  };
}

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

function shouldUseConsoleMailFallback() {
  return process.env.NODE_ENV !== "production";
}

export function isUsingDevelopmentMailFallback() {
  const host = process.env.EMAIL_SERVER_HOST;
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASS;
  const from = process.env.EMAIL_FROM || user;

  return shouldUseConsoleMailFallback() && (!host || !user || !pass || !from);
}

function logDevelopmentEmail({
  to,
  subject,
  code,
  verifyUrl,
}: {
  to: string;
  subject: string;
  code: string;
  verifyUrl?: string;
}) {
  console.info(
    [
      "[email-dev]",
      `to=${to}`,
      `subject=${subject}`,
      `code=${code}`,
      verifyUrl ? `url=${verifyUrl}` : null,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function buildCodeEmailHtml({
  title,
  greeting,
  description,
  code,
  verifyUrl,
  buttonLabel,
  safetyText,
}: {
  title: string;
  greeting: string;
  description: string;
  code: string;
  verifyUrl?: string;
  buttonLabel?: string;
  safetyText: string;
}) {
  const codeDigits = code
    .split("")
    .map(
      (digit) => `
        <span style="display:inline-flex;align-items:center;justify-content:center;width:38px;height:46px;border-radius:12px;background:#111827;border:1px solid rgba(255,255,255,0.12);font-size:24px;font-weight:800;letter-spacing:0;color:#f8fafc;">
          ${escapeHtml(digit)}
        </span>`
    )
    .join("");

  return `
    <div style="margin:0;padding:0;background:#f4f7fb;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f7fb;">
        <tr>
          <td align="center" style="padding:32px 16px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border-collapse:collapse;border-radius:24px;overflow:hidden;background:#ffffff;border:1px solid #e5e7eb;box-shadow:0 18px 50px rgba(15,23,42,0.10);">
              <tr>
                <td style="padding:28px 28px 18px;background:#020617;color:#ffffff;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="vertical-align:middle;">
                        <img src="cid:${LOGO_CID}" width="72" alt="Jak Barber" style="display:block;border:0;outline:none;text-decoration:none;width:72px;height:auto;" />
                      </td>
                      <td align="right" style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#94a3b8;">
                        Atendimento com hora marcada
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:1.2;color:#ffffff;">
                    ${escapeHtml(title)}
                  </h1>
                </td>
              </tr>

              <tr>
                <td style="padding:28px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                  <p style="margin:0;font-size:16px;line-height:1.6;font-weight:700;">
                    ${escapeHtml(greeting)}
                  </p>
                  <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#4b5563;">
                    ${escapeHtml(description)}
                  </p>

                  <div style="margin:24px 0 0;padding:18px;border-radius:20px;background:#020617;text-align:center;">
                    <p style="margin:0 0 12px;font-size:12px;line-height:1.4;text-transform:uppercase;letter-spacing:0.18em;color:#7dd3fc;">
                      Codigo de seguranca
                    </p>
                    <div style="display:inline-flex;gap:8px;">
                      ${codeDigits}
                    </div>
                    <p style="margin:14px 0 0;font-size:13px;line-height:1.5;color:#cbd5e1;">
                      Este codigo expira em 10 minutos.
                    </p>
                  </div>

                  ${
                    verifyUrl && buttonLabel
                      ? `<p style="margin:24px 0 0;">
                          <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;border-radius:14px;background:#0ea5e9;padding:14px 18px;font-size:14px;font-weight:800;color:#ffffff;text-decoration:none;">
                            ${escapeHtml(buttonLabel)}
                          </a>
                        </p>`
                      : ""
                  }

                  <p style="margin:24px 0 0;padding-top:18px;border-top:1px solid #e5e7eb;font-size:13px;line-height:1.6;color:#6b7280;">
                    ${escapeHtml(safetyText)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
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
  let config: ReturnType<typeof getMailConfig>;

  try {
    config = getMailConfig();
  } catch (error) {
    if (shouldUseConsoleMailFallback()) {
      logDevelopmentEmail({
        to,
        subject: "Codigo de verificacao - Jak Barber",
        code,
        verifyUrl,
      });
      return;
    }

    throw error;
  }

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
    from: formatFromAddress(config.from),
    to,
    subject: "Codigo de verificacao - Jak Barber",
    text: `Ola, ${name}.\n\nSeu codigo de verificacao para ${accountLabel} e: ${code}\n\nEsse codigo expira em 10 minutos.${verifyUrl ? `\n\nVoce tambem pode abrir: ${verifyUrl}` : ""}\n\nSe voce nao solicitou essa verificacao, ignore esta mensagem.`,
    html: buildCodeEmailHtml({
      title: "Confirme seu cadastro",
      greeting: `Ola, ${name}.`,
      description: `Use o codigo abaixo para concluir ${accountLabel}.`,
      code,
      verifyUrl,
      buttonLabel: "Abrir tela de verificacao",
      safetyText: "Se voce nao solicitou esse cadastro, ignore esta mensagem.",
    }),
    attachments: [getLogoAttachment()],
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
  let config: ReturnType<typeof getMailConfig>;

  try {
    config = getMailConfig();
  } catch (error) {
    if (shouldUseConsoleMailFallback()) {
      logDevelopmentEmail({
        to,
        subject: "Recuperacao de senha - Jak Barber",
        code,
      });
      return;
    }

    throw error;
  }

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
    from: formatFromAddress(config.from),
    to,
    subject: "Recuperacao de senha - Jak Barber",
    text: `Ola, ${name}.\n\nSeu codigo para redefinir a senha e: ${code}\n\nEsse codigo expira em 10 minutos.\n\nSe voce nao solicitou a redefinicao, ignore esta mensagem.`,
    html: buildCodeEmailHtml({
      title: "Redefina sua senha",
      greeting: `Ola, ${name}.`,
      description: "Use o codigo abaixo para criar uma nova senha de acesso.",
      code,
      safetyText: "Se voce nao solicitou a redefinicao, ignore esta mensagem.",
    }),
    attachments: [getLogoAttachment()],
  });
}
