"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import { formatCurrency } from "@/lib/utils";

type BarberOption = {
  id: string;
  name: string | null;
};

type ServiceOption = {
  id: string;
  barberId: string | null;
  name: string;
  price: number;
  duration: number;
  bufferAfter: number;
};

type BookingClientProps = {
  barbers: BarberOption[];
  services: ServiceOption[];
  initialDate: string;
  nextDays: string[];
};

type PeriodSlots = {
  morning: string[];
  afternoon: string[];
  night: string[];
};

function formatShortDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" });
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  return {
    weekday,
    day,
  };
}

export default function BookingClient({
  barbers,
  services,
  initialDate,
  nextDays,
}: BookingClientProps) {
  const [selectedBarberId, setSelectedBarberId] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [periodSlots, setPeriodSlots] = useState<PeriodSlots>({
    morning: [],
    afternoon: [],
    night: [],
  });
  const [isDayAvailable, setIsDayAvailable] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingSlot, setBookingSlot] = useState<string | null>(null);

  const visibleServices = useMemo(
    () =>
      selectedBarberId
        ? services.filter(
            (service) => service.barberId === null || service.barberId === selectedBarberId
          )
        : [],
    [selectedBarberId, services]
  );

  const selectedServices = useMemo(
    () => visibleServices.filter((service) => selectedServiceIds.includes(service.id)),
    [selectedServiceIds, visibleServices]
  );

  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === selectedBarberId),
    [barbers, selectedBarberId]
  );

  const selectedBaseDuration = selectedServices.reduce(
    (sum, service) => sum + service.duration,
    0
  );
  const selectedOccupiedDuration = selectedServices.reduce(
    (sum, service) => sum + service.duration + Math.max(0, service.bufferAfter || 0),
    0
  );
  const selectedPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalSlots =
    periodSlots.morning.length + periodSlots.afternoon.length + periodSlots.night.length;

  useEffect(() => {
    setSelectedServiceIds((current) =>
      current.filter((serviceId) =>
        visibleServices.some((service) => service.id === serviceId)
      )
    );
    setBookingError(null);
    setBookingSuccess(null);
  }, [visibleServices]);

  useEffect(() => {
    if (!selectedBarberId || selectedServiceIds.length === 0 || !selectedDate) {
      setPeriodSlots({
        morning: [],
        afternoon: [],
        night: [],
      });
      setIsDayAvailable(false);
      setAvailabilityError(null);
      return;
    }

    const controller = new AbortController();

    async function loadAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError(null);

      try {
        const response = await fetch("/api/booking/availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            barberId: selectedBarberId,
            serviceIds: selectedServiceIds,
            date: selectedDate,
          }),
          signal: controller.signal,
        });

        const data = (await response.json()) as {
          message?: string;
          isDayAvailable?: boolean;
          periodSlots?: PeriodSlots;
        };

        if (!response.ok) {
          throw new Error(data.message || "Nao foi possivel carregar os horarios.");
        }

        setIsDayAvailable(Boolean(data.isDayAvailable));
        setPeriodSlots(
          data.periodSlots || {
            morning: [],
            afternoon: [],
            night: [],
          }
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setIsDayAvailable(false);
        setPeriodSlots({
          morning: [],
          afternoon: [],
          night: [],
        });
        setAvailabilityError(
          error instanceof Error
            ? error.message
            : "Nao foi possivel carregar os horarios."
        );
      } finally {
        if (!controller.signal.aborted) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => controller.abort();
  }, [selectedBarberId, selectedDate, selectedServiceIds]);

  function toggleService(serviceId: string) {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
    setBookingError(null);
    setBookingSuccess(null);
  }

  async function bookAppointment(time: string) {
    setBookingSlot(time);
    setBookingError(null);
    setBookingSuccess(null);

    try {
      const response = await fetch("/api/booking/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId: selectedBarberId,
          serviceIds: selectedServiceIds,
          date: selectedDate,
          time,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel concluir o agendamento.");
      }

      setBookingSuccess(data.message || "Agendamento confirmado com sucesso.");

      const refreshed = await fetch("/api/booking/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          barberId: selectedBarberId,
          serviceIds: selectedServiceIds,
          date: selectedDate,
        }),
      });

      if (refreshed.ok) {
        const refreshedData = (await refreshed.json()) as {
          isDayAvailable?: boolean;
          periodSlots?: PeriodSlots;
        };

        setIsDayAvailable(Boolean(refreshedData.isDayAvailable));
        setPeriodSlots(
          refreshedData.periodSlots || {
            morning: [],
            afternoon: [],
            night: [],
          }
        );
      }
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel concluir o agendamento."
      );
    } finally {
      setBookingSlot(null);
    }
  }

  return (
    <div className="page-shell max-w-6xl text-white">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--brand-strong)]">
            Reserva mobile
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Agendar horario
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            Escolha tudo sem refresh: cada toque atualiza so a interface.
          </p>
        </div>

        <Link
          href="/customer"
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
        >
          Voltar
        </Link>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr] xl:gap-6">
        <section className="surface-card rounded-[28px] p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Escolhas</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Marque barbeiro, servicos e data sem recarregar a pagina.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-zinc-300">Barbeiro</label>
              <select
                value={selectedBarberId}
                onChange={(event) => setSelectedBarberId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 outline-none"
              >
                <option value="">Escolha um barbeiro</option>
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
                {visibleServices.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-zinc-500">
                    Escolha o barbeiro para liberar os servicos.
                  </p>
                ) : (
                  visibleServices.map((service) => {
                    const checked = selectedServiceIds.includes(service.id);

                    return (
                      <label
                        key={service.id}
                        className={`flex cursor-pointer gap-3 rounded-2xl border px-4 py-3 transition ${
                          checked
                            ? "border-[var(--brand)] bg-[var(--brand-muted)] text-white"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(service.id)}
                          className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20"
                        />
                        <div className="min-w-0 text-sm">
                          <p className="font-semibold">{service.name}</p>
                          <p className="mt-1 text-xs leading-5 text-zinc-400">
                            {formatCurrency(service.price)} · {service.duration} min
                            {service.bufferAfter > 0
                              ? ` + ${service.bufferAfter} min de intervalo`
                              : ""}
                            {service.barberId ? " · Exclusivo" : " · Geral"}
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm text-zinc-300">Data</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-3">
                {nextDays.map((day) => {
                  const isSelected = day === selectedDate;
                  const { weekday, day: dayLabel } = formatShortDate(day);
                  const disabled = !selectedBarberId || selectedServiceIds.length === 0;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedDate(day)}
                      className={`rounded-2xl border px-3 py-3 text-left transition ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--brand-muted)]"
                          : "border-white/10 bg-black/20 hover:border-white/20"
                      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
                        {weekday}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">{dayLabel}</p>
                    </button>
                  );
                })}
              </div>

              {(!selectedBarberId || selectedServiceIds.length === 0) && (
                <p className="mt-3 text-xs text-zinc-500">
                  Escolha barbeiro e servicos para liberar a agenda.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="surface-card rounded-[28px] p-4 sm:p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Horarios</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {selectedDate
                  ? `Data escolhida: ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR")}`
                  : "Escolha um dia para continuar."}
              </p>
            </div>

            {selectedServices.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-200">
                {selectedServices.length} servico(s) · {formatCurrency(selectedPrice)}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryCard
              label="Barbeiro"
              value={selectedBarber?.name || "Nao escolhido"}
            />
            <SummaryCard
              label="Duracao"
              value={
                selectedServices.length > 0
                  ? `${selectedBaseDuration} min${selectedOccupiedDuration > selectedBaseDuration ? ` base + intervalo = ${selectedOccupiedDuration} min` : ""}`
                  : "Escolha um servico"
              }
            />
            <SummaryCard
              label="Disponiveis"
              value={selectedServices.length > 0 ? `${totalSlots} horarios` : "Aguardando filtros"}
            />
          </div>

          {selectedServices.length > 0 && (
            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-white">Selecionado</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedServices.map((service) => (
                  <span
                    key={service.id}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-200"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 space-y-3">
            <FeedbackMessage message={availabilityError} tone="error" />
            <FeedbackMessage message={bookingError} tone="error" />
            <FeedbackMessage message={bookingSuccess} tone="success" />

            {bookingSuccess ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/customer/agendamentos"
                  className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Ver meus agendamentos
                </Link>
                <button
                  type="button"
                  onClick={() => setBookingSuccess(null)}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
                >
                  Continuar agendando
                </button>
              </div>
            ) : null}
          </div>

          {!selectedBarberId || selectedServiceIds.length === 0 || !selectedDate ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
              Complete as escolhas ao lado para carregar os horarios.
            </div>
          ) : availabilityLoading ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 px-4 py-6 text-sm text-zinc-300">
              Carregando horarios...
            </div>
          ) : !isDayAvailable ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
              Esse barbeiro nao possui horario ativo nesse dia.
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <TimeSection
                title="Manha"
                slots={periodSlots.morning}
                bookingSlot={bookingSlot}
                onBook={bookAppointment}
              />

              <TimeSection
                title="Tarde"
                slots={periodSlots.afternoon}
                bookingSlot={bookingSlot}
                onBook={bookAppointment}
              />

              <TimeSection
                title="Noite"
                slots={periodSlots.night}
                bookingSlot={bookingSlot}
                onBook={bookAppointment}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white">{value}</p>
    </div>
  );
}

function TimeSection({
  title,
  slots,
  bookingSlot,
  onBook,
}: {
  title: string;
  slots: string[];
  bookingSlot: string | null;
  onBook: (slot: string) => Promise<void>;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          {slots.length} disponiveis
        </span>
      </div>

      {slots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-zinc-500">
          Nenhum horario livre nesse periodo.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              disabled={Boolean(bookingSlot)}
              onClick={() => void onBook(slot)}
              className="min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold transition hover:border-[var(--brand)]/50 hover:bg-[var(--brand-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bookingSlot === slot ? "Reservando..." : slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
