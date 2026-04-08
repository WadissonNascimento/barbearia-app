import { normalizeAppointmentStatus } from "@/lib/appointmentStatus";

export const weekDays = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terca" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sabado" },
] as const;

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function generateSlots(startTime: string, endTime: string, step = 10) {
  const slots: string[] = [];
  let current = toMinutes(startTime);
  const end = toMinutes(endTime);

  while (current < end) {
    slots.push(minutesToTime(current));
    current += step;
  }

  return slots;
}

export function isBlockedPeriod(
  startDate: Date,
  endDate: Date,
  blocks: Array<{ startDateTime: Date; endDateTime: Date }>
) {
  return blocks.some((block) => {
    return startDate < new Date(block.endDateTime) &&
      endDate > new Date(block.startDateTime);
  });
}

export function isActiveAppointmentStatus(status: string) {
  const normalized = normalizeAppointmentStatus(status);
  return normalized !== "CANCELLED" && normalized !== "NO_SHOW";
}
