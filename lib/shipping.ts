export function normalizeZipCode(zipCode: string) {
  return zipCode.replace(/\D/g, "").slice(0, 8);
}

export function isValidZipCode(zipCode: string) {
  return normalizeZipCode(zipCode).length === 8;
}

export function formatZipCode(zipCode: string) {
  const normalized = normalizeZipCode(zipCode);

  if (normalized.length !== 8) {
    return zipCode;
  }

  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}

export type ShippingQuote = {
  zipCode: string;
  method: string;
  cost: number;
  etaLabel: string;
};

export function calculateShipping(zipCode: string, subtotal: number): ShippingQuote {
  const normalized = normalizeZipCode(zipCode);

  if (!isValidZipCode(normalized)) {
    throw new Error("Informe um CEP valido com 8 digitos.");
  }

  const prefix = Number(normalized.slice(0, 2));

  let method = "Entrega padrao";
  let cost = 24.9;
  let etaLabel = "4 a 7 dias uteis";

  if (prefix >= 1 && prefix <= 9) {
    method = "Motoboy metropolitano";
    cost = subtotal >= 180 ? 0 : 12.9;
    etaLabel = "Mesmo dia ou proximo dia util";
  } else if (prefix >= 10 && prefix <= 19) {
    method = "Sedex regional";
    cost = subtotal >= 220 ? 8.9 : 18.9;
    etaLabel = "2 a 4 dias uteis";
  } else if (prefix >= 20 && prefix <= 39) {
    method = "Transportadora sudeste";
    cost = subtotal >= 250 ? 12.9 : 21.9;
    etaLabel = "3 a 5 dias uteis";
  } else if (prefix >= 40 && prefix <= 69) {
    method = "Transportadora nacional";
    cost = subtotal >= 280 ? 16.9 : 27.9;
    etaLabel = "4 a 7 dias uteis";
  } else {
    method = "Transportadora estendida";
    cost = subtotal >= 320 ? 18.9 : 31.9;
    etaLabel = "5 a 9 dias uteis";
  }

  return {
    zipCode: normalized,
    method,
    cost: Number(cost.toFixed(2)),
    etaLabel,
  };
}
