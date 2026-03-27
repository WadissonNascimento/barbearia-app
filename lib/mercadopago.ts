import { MercadoPagoConfig, Preference } from "mercadopago";

export function getMercadoPagoClient() {
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN não configurado.");
  }

  return new MercadoPagoConfig({ accessToken });
}

export function getPreferenceClient() {
  return new Preference(getMercadoPagoClient());
}
