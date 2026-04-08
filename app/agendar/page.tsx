import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createAppointmentAction } from "./actions";
import { AutoSubmitFilters } from "./AutoSubmitFilters";

type SearchParams = {
  barberId?: string;
  serviceId?: string;
  date?: string;
};

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function generateSlots(startHour: number, endHour: number) {
  const slots: string[] = [];
  const step = 10;

  let current = startHour * 60;
  const end = endHour * 60;

  while (current < end) {
    slots.push(minutesToTime(current));
    current += step;
  }

  return slots;
}

function formatDateLabel(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextDays(count: number) {
  const days: string[] = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const current = new Date(base);
    current.setDate(base.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");

    days.push(`${year}-${month}-${day}`);
  }

  return days;
}

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "CUSTOMER") {
    redirect("/painel");
  }

  const barbers = await prisma.user.findMany({
    where: {
      role: "BARBER",
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const services = await prisma.service.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  const today = getTodayString();
  const nextDays = getNextDays(14);

  const selectedBarberId = searchParams.barberId || "";
  const selectedServiceId = searchParams.serviceId || "";
  const selectedDate = searchParams.date || today;

  let selectedServiceDuration = 0;
  let morningSlots: string[] = [];
  let afternoonSlots: string[] = [];
  let nightSlots: string[] = [];

  if (selectedBarberId && selectedServiceId && selectedDate) {
    const selectedService = await prisma.service.findFirst({
      where: {
        id: selectedServiceId,
        isActive: true,
      },
    });

    if (selectedService) {
      selectedServiceDuration = selectedService.duration;

      const appointments = await prisma.appointment.findMany({
        where: {
          barberId: selectedBarberId,
          date: {
            gte: new Date(`${selectedDate}T00:00:00`),
            lte: new Date(`${selectedDate}T23:59:59.999`),
          },
          status: {
            not: "CANCELLED",
          },
        },
        include: {
          service: true,
        },
      });

      const now = new Date();
      const isToday = selectedDate === today;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const filterSlots = (slots: string[], periodEndHour: number) => {
        return slots.filter((slot) => {
          const candidateStart = toMinutes(slot);
          const candidateEnd = candidateStart + selectedService.duration;
          const periodEnd = periodEndHour * 60;

          if (candidateEnd > periodEnd) {
            return false;
          }

          if (isToday && candidateStart <= nowMinutes) {
            return false;
          }

          const hasConflict = appointments.some((appointment) => {
            const appointmentDate = new Date(appointment.date);
            const existingStart =
              appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
            const existingEnd = existingStart + appointment.service.duration;

            return (
              candidateStart < existingEnd &&
              candidateEnd > existingStart
            );
          });

          return !hasConflict;
        });
      };

      morningSlots = filterSlots(generateSlots(8, 12), 12);
      afternoonSlots = filterSlots(generateSlots(13, 18), 18);
      nightSlots = filterSlots(generateSlots(18, 21), 21);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <AutoSubmitFilters />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendar horário</h1>
          <p className="text-zinc-400">
            Escolha o barbeiro, o serviço, a data e depois selecione um horário disponível.
          </p>
        </div>

        <Link
          href="/customer"
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Voltar
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-4 text-xl font-semibold">Filtros do agendamento</h2>

          <form method="GET" data-auto-submit="true" className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Barbeiro</label>
              <select
                name="barberId"
                defaultValue={selectedBarberId}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
              >
                <option value="">Selecione</option>
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-zinc-300">Serviço</label>
              <select
                name="serviceId"
                defaultValue={selectedServiceId}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none"
              >
                <option value="">Selecione</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price.toFixed(2)} - {service.duration} min
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-3 block text-sm text-zinc-300">Calendário</label>

              <div className="grid grid-cols-2 gap-2">
                {nextDays.map((day) => {
                  const isSelected = day === selectedDate;

                  return (
                    <label
                      key={day}
                      className={`cursor-pointer rounded-xl border px-3 py-3 text-left text-sm transition ${
                        isSelected
                          ? "border-white bg-white text-black"
                          : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                      } ${
                        !selectedBarberId || !selectedServiceId
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="date"
                        value={day}
                        defaultChecked={isSelected}
                        disabled={!selectedBarberId || !selectedServiceId}
                        className="hidden"
                      />
                      {formatDateLabel(day)}
                    </label>
                  );
                })}
              </div>

              {(!selectedBarberId || !selectedServiceId) && (
                <p className="mt-3 text-xs text-zinc-500">
                  Primeiro selecione o barbeiro e o serviço para liberar as datas.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Horários disponíveis</h2>
              <p className="text-sm text-zinc-400">
                {selectedDate
                  ? `Data escolhida: ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR")}`
                  : "Escolha barbeiro, serviço e data."}
              </p>
            </div>

            {selectedServiceDuration > 0 && (
              <div className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                Duração do serviço: {selectedServiceDuration} min
              </div>
            )}
          </div>

          {!selectedBarberId || !selectedServiceId || !selectedDate ? (
            <p className="text-zinc-400">
              Preencha barbeiro, serviço e data para carregar os horários.
            </p>
          ) : (
            <div className="space-y-8">
              <TimeSection
                title="MANHÃ"
                slots={morningSlots}
                colorClass="text-sky-400"
                barberId={selectedBarberId}
                serviceId={selectedServiceId}
                date={selectedDate}
              />

              <TimeSection
                title="TARDE"
                slots={afternoonSlots}
                colorClass="text-yellow-400"
                barberId={selectedBarberId}
                serviceId={selectedServiceId}
                date={selectedDate}
              />

              <TimeSection
                title="NOITE"
                slots={nightSlots}
                colorClass="text-purple-400"
                barberId={selectedBarberId}
                serviceId={selectedServiceId}
                date={selectedDate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimeSection({
  title,
  slots,
  colorClass,
  barberId,
  serviceId,
  date,
}: {
  title: string;
  slots: string[];
  colorClass: string;
  barberId: string;
  serviceId: string;
  date: string;
}) {
  return (
    <div>
      <h3 className={`mb-3 text-lg font-bold ${colorClass}`}>--- {title} ---</h3>

      {slots.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum horário disponível nesse período.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {slots.map((slot) => (
            <form key={slot} action={createAppointmentAction}>
              <input type="hidden" name="barberId" value={barberId} />
              <input type="hidden" name="serviceId" value={serviceId} />
              <input type="hidden" name="date" value={date} />
              <input type="hidden" name="time" value={slot} />
              <input type="hidden" name="notes" value="" />

              <button
                type="submit"
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm transition hover:border-white hover:bg-zinc-800"
              >
                {slot}
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
