import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  generateSlots,
  getAppointmentServicesOccupiedDuration,
  isActiveAppointmentStatus,
  isBlockedPeriod,
  isBlockedByRecurringBlock,
  toMinutes,
} from "@/lib/barberSchedule";
import { formatCurrency } from "@/lib/utils";
import { AutoSubmitFilters } from "./AutoSubmitFilters";
import AppointmentSlotForm from "@/components/AppointmentSlotForm";

type SearchParams = {
  barberId?: string;
  serviceIds?: string;
  date?: string;
};

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

  for (let index = 0; index < count; index += 1) {
    const current = new Date(base);
    current.setDate(base.getDate() + index);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");

    days.push(`${year}-${month}-${day}`);
  }

  return days;
}

function splitSlotsByPeriod(slots: string[]) {
  return {
    morning: slots.filter((slot) => toMinutes(slot) < 12 * 60),
    afternoon: slots.filter(
      (slot) => toMinutes(slot) >= 12 * 60 && toMinutes(slot) < 18 * 60
    ),
    night: slots.filter((slot) => toMinutes(slot) >= 18 * 60),
  };
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

  const today = getTodayString();
  const nextDays = getNextDays(14);
  const selectedBarberId = searchParams.barberId || "";
  const selectedServiceIds = String(searchParams.serviceIds || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const selectedDate = searchParams.date || today;

  const services = selectedBarberId
    ? await prisma.service.findMany({
        where: {
          OR: [{ barberId: selectedBarberId }, { barberId: null }],
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
      })
    : [];

  const selectedServices = services.filter((service) =>
    selectedServiceIds.includes(service.id)
  );
  const selectedTotalDuration = getAppointmentServicesOccupiedDuration(
    selectedServices.map((service) => ({
      durationSnapshot: service.duration,
      bufferAfter: service.bufferAfter,
    }))
  );
  const selectedBaseDuration = selectedServices.reduce(
    (sum, service) => sum + service.duration,
    0
  );
  const selectedTotalPrice = selectedServices.reduce(
    (sum, service) => sum + service.price,
    0
  );

  let isDayAvailable = false;
  let periodSlots = {
    morning: [] as string[],
    afternoon: [] as string[],
    night: [] as string[],
  };

  if (
    selectedBarberId &&
    selectedServiceIds.length > 0 &&
    selectedServices.length === selectedServiceIds.length &&
    selectedDate
  ) {
    const selectedDay = new Date(`${selectedDate}T00:00:00`);
    const dayStart = new Date(`${selectedDate}T00:00:00`);
    const dayEnd = new Date(`${selectedDate}T23:59:59.999`);
    const dayOfWeek = selectedDay.getDay();

    const [availability, appointments, blocks, recurringBlocks] = await Promise.all([
      prisma.barberAvailability.findFirst({
        where: {
          barberId: selectedBarberId,
          weekDay: dayOfWeek,
          isActive: true,
        },
      }),
      prisma.appointment.findMany({
        where: {
          barberId: selectedBarberId,
          date: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
        include: {
          services: true,
        },
      }),
      prisma.barberBlock.findMany({
        where: {
          barberId: selectedBarberId,
          startDateTime: {
            lte: dayEnd,
          },
          endDateTime: {
            gte: dayStart,
          },
        },
      }),
      prisma.recurringBarberBlock.findMany({
        where: {
          barberId: selectedBarberId,
          weekDay: dayOfWeek,
          isActive: true,
        },
      }),
    ]);

    if (availability) {
      isDayAvailable = true;

      const generatedSlots = generateSlots(
        availability.startTime,
        availability.endTime
      );
      const dayEndMinutes = toMinutes(availability.endTime);
      const now = new Date();
      const isToday = selectedDate === today;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const validSlots = generatedSlots.filter((slot) => {
        const candidateStart = toMinutes(slot);
        const candidateEnd = candidateStart + selectedTotalDuration;

        if (candidateEnd > dayEndMinutes) {
          return false;
        }

        if (isToday && candidateStart <= nowMinutes) {
          return false;
        }

        const startDate = new Date(`${selectedDate}T${slot}:00`);
        const endDate = new Date(startDate.getTime() + selectedTotalDuration * 60000);

        if (isBlockedPeriod(startDate, endDate, blocks)) {
          return false;
        }

        if (
          isBlockedByRecurringBlock(candidateStart, candidateEnd, recurringBlocks)
        ) {
          return false;
        }

        const hasConflict = appointments.some((appointment) => {
          if (!isActiveAppointmentStatus(appointment.status)) {
            return false;
          }

          const appointmentDate = new Date(appointment.date);
          const existingStart =
            appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
          const existingEnd =
            existingStart + getAppointmentServicesOccupiedDuration(appointment.services);

          return candidateStart < existingEnd && candidateEnd > existingStart;
        });

        return !hasConflict;
      });

      periodSlots = splitSlotsByPeriod(validSlots);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <AutoSubmitFilters />

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendar horario</h1>
          <p className="text-zinc-400">
            Escolha o barbeiro, combine os servicos, defina a data e reserve o horario.
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
              <label className="mb-3 block text-sm text-zinc-300">Servicos</label>
              <div className="space-y-2">
                {services.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-4 text-sm text-zinc-500">
                    Selecione um barbeiro para ver os servicos disponiveis.
                  </p>
                ) : (
                  services.map((service) => {
                    const checked = selectedServiceIds.includes(service.id);

                    return (
                      <label
                        key={service.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition ${
                          checked
                            ? "border-white bg-white text-black"
                            : "border-zinc-700 bg-zinc-950 hover:border-zinc-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="serviceIds"
                          value={service.id}
                          defaultChecked={checked}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="text-sm">
                          <p className="font-semibold">{service.name}</p>
                          <p className={checked ? "text-black/70" : "text-zinc-400"}>
                            {formatCurrency(service.price)} • {service.duration} min
                            {service.bufferAfter > 0
                              ? ` + ${service.bufferAfter} min de intervalo`
                              : ""}
                            {service.barberId ? " • Exclusivo" : " • Geral"}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm text-zinc-300">Calendario</label>

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
                        !selectedBarberId || selectedServiceIds.length === 0
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="date"
                        value={day}
                        defaultChecked={isSelected}
                        disabled={!selectedBarberId || selectedServiceIds.length === 0}
                        className="hidden"
                      />
                      {formatDateLabel(day)}
                    </label>
                  );
                })}
              </div>

              {(!selectedBarberId || selectedServiceIds.length === 0) && (
                <p className="mt-3 text-xs text-zinc-500">
                  Primeiro selecione o barbeiro e pelo menos um servico para liberar as datas.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Horarios disponiveis</h2>
              <p className="text-sm text-zinc-400">
                {selectedDate
                  ? `Data escolhida: ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR")}`
                  : "Escolha barbeiro, servicos e data."}
              </p>
            </div>

            {selectedServices.length > 0 && (
              <div className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
                {selectedServices.length} servico(s) • {selectedBaseDuration} min base
                {selectedTotalDuration > selectedBaseDuration
                  ? ` • ${selectedTotalDuration} min ocupados`
                  : ""}
                {` • ${formatCurrency(selectedTotalPrice)}`}
              </div>
            )}
          </div>

          {selectedServices.length > 0 && (
            <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="text-sm font-medium text-white">Combo selecionado</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-300">
                {selectedServices.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full border border-zinc-700 px-3 py-1"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!selectedBarberId || selectedServiceIds.length === 0 || !selectedDate ? (
            <p className="text-zinc-400">
              Preencha barbeiro, servicos e data para carregar os horarios.
            </p>
          ) : !isDayAvailable ? (
            <p className="text-zinc-400">
              Este barbeiro nao possui disponibilidade ativa configurada para esse dia.
            </p>
          ) : (
            <div className="space-y-8">
              <TimeSection
                title="MANHA"
                slots={periodSlots.morning}
                colorClass="text-sky-400"
                barberId={selectedBarberId}
                serviceIds={selectedServiceIds}
                date={selectedDate}
              />

              <TimeSection
                title="TARDE"
                slots={periodSlots.afternoon}
                colorClass="text-yellow-400"
                barberId={selectedBarberId}
                serviceIds={selectedServiceIds}
                date={selectedDate}
              />

              <TimeSection
                title="NOITE"
                slots={periodSlots.night}
                colorClass="text-purple-400"
                barberId={selectedBarberId}
                serviceIds={selectedServiceIds}
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
  serviceIds,
  date,
}: {
  title: string;
  slots: string[];
  colorClass: string;
  barberId: string;
  serviceIds: string[];
  date: string;
}) {
  return (
    <div>
      <h3 className={`mb-3 text-lg font-bold ${colorClass}`}>{title}</h3>

      {slots.length === 0 ? (
        <p className="text-sm text-zinc-500">Nenhum horario disponivel nesse periodo.</p>
      ) : (
        <AppointmentSlotForm
          barberId={barberId}
          serviceIds={serviceIds}
          date={date}
          slots={slots}
        />
      )}
    </div>
  );
}
