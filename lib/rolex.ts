export const ROLES = {
  ADMIN: "ADMIN",
  BARBER: "BARBER",
  CUSTOMER: "CUSTOMER",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];