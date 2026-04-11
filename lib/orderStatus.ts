export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "READY_FOR_PICKUP",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const orderStatusLabel: Record<string, string> = {
  PENDING: "Aguardando confirmacao",
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparo",
  SHIPPED: "Saiu para entrega",
  READY_FOR_PICKUP: "Pronto para retirada",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const orderStatusVariant: Record<
  string,
  "info" | "success" | "warning" | "danger" | "neutral"
> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PREPARING: "info",
  SHIPPED: "info",
  READY_FOR_PICKUP: "info",
  DELIVERED: "success",
  CANCELLED: "danger",
};
