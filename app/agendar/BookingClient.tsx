"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import FeedbackMessage from "@/components/FeedbackMessage";
import { formatCurrency } from "@/lib/utils";

type BarberOption = {
  id: string;
  name: string | null;
  image: string | null;
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
  whatsappNumber: string;
};

type PeriodSlots = {
  morning: string[];
  afternoon: string[];
  night: string[];
};

type BookingDetails = {
  date: string;
  time: string;
  barberName: string;
  serviceNames: string[];
  duration: number;
  price: number;
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

function getBarberSpecialty(index: number) {
  const specialties = [
    "Especialista em degrade e acabamento fino",
    "Barba alinhada e corte classico",
    "Corte moderno e atendimento rapido",
  ];

  return specialties[index % specialties.length];
}

function getLocalBarberImage(image: string | null) {
  return image?.startsWith("/") ? image : null;
}

export default function BookingClient({
  barbers,
  services,
  initialDate,
  nextDays,
  whatsappNumber,
}: BookingClientProps) {
  const [selectedBarberId, setSelectedBarberId] = useState(() => barbers[0]?.id ?? "");
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
  const [confirmationSlot, setConfirmationSlot] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [previewBarber, setPreviewBarber] = useState<BarberOption | null>(null);

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
  const selectedBarberIndex = Math.max(
    0,
    barbers.findIndex((barber) => barber.id === selectedBarberId)
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
    setBookingDetails(null);
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
    setBookingDetails(null);
  }

  function openBookingConfirmation(time: string) {
    setBookingError(null);
    setBookingSuccess(null);
    setConfirmationSlot(time);
  }

  async function bookAppointment(time: string, notes = "") {
    setConfirmationSlot(null);
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
          notes,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel concluir o agendamento.");
      }

      setBookingSuccess(data.message || "Agendamento confirmado com sucesso.");
      setBookingDetails({
        date: selectedDate,
        time,
        barberName: selectedBarber?.name || "Barbeiro",
        serviceNames: selectedServices.map((service) => service.name),
        duration: selectedOccupiedDuration,
        price: selectedPrice,
      });

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
    <div className="page-shell max-w-5xl overflow-x-hidden text-white">
      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            Agendar horario
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
            Escolha o servico e toque em um horario disponivel.
          </p>
        </div>

        <Link
          href="/customer"
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/5"
        >
          Voltar
        </Link>
      </div>

      <section className="surface-card max-w-full overflow-hidden rounded-[20px] p-3 sm:rounded-[24px] sm:p-5">
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                Barbeiro
              </label>
              <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
                {barbers.map((barber, index) => {
                  const checked = selectedBarberId === barber.id;
                  const imageSrc = getLocalBarberImage(barber.image);

                  return (
                    <button
                      key={barber.id}
                      type="button"
                      onClick={() => {
                        setSelectedBarberId(barber.id);
                        setBookingError(null);
                        setBookingSuccess(null);
                        setBookingDetails(null);
                      }}
                      className={`min-w-[230px] rounded-2xl border px-3 py-3 text-left transition sm:min-w-0 sm:w-full ${
                        checked
                          ? "border-[var(--brand)] bg-[var(--brand-muted)] text-white shadow-[0_18px_36px_rgba(14,165,233,0.18)]"
                          : "border-white/10 bg-black/20 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          onClick={(event) => {
                            event.stopPropagation();
                            if (imageSrc) {
                              setPreviewBarber(barber);
                            }
                          }}
                          title={imageSrc ? "Ampliar foto" : undefined}
                          className={`relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/30 via-white/10 to-black/20 text-sm font-bold text-[var(--brand-strong)] ${
                            imageSrc ? "cursor-zoom-in transition hover:border-[var(--brand)]/50" : ""
                          }`}
                        >
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={barber.name || "Barbeiro"}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            (barber.name || "B").slice(0, 1)
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {barber.name}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-zinc-400">
                            {getBarberSpecialty(index)}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedBarber ? (
                <BarberProfileStrip
                  barber={selectedBarber}
                  specialty={getBarberSpecialty(selectedBarberIndex)}
                  servicesCount={visibleServices.length}
                  onPreview={setPreviewBarber}
                />
              ) : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                Servicos
              </label>
              <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                {visibleServices.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-zinc-500 sm:col-span-2">
                    Escolha o barbeiro para liberar os servicos.
                  </p>
                ) : (
                  visibleServices.map((service) => {
                    const checked = selectedServiceIds.includes(service.id);

                    return (
                      <label
                        key={service.id}
                        className={`flex min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 transition sm:px-4 ${
                          checked
                            ? "border-[var(--brand)] bg-[var(--brand-muted)] text-white"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleService(service.id)}
                          className="sr-only"
                        />
                        <div className="min-w-0 text-sm">
                          <p className="truncate font-semibold">{service.name}</p>
                          <p className="mt-1 truncate text-xs text-zinc-400">
                            {formatCurrency(service.price)} - {service.duration} min
                          </p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-200">
                Data
              </label>
              <div className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
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
                      className={`min-w-[82px] rounded-2xl border px-3 py-3 text-left transition ${
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
          <div className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
            <BookingSummary
              barberName={selectedBarber?.name || "Nao escolhido"}
              services={selectedServices.map((service) => service.name)}
              date={selectedDate}
              duration={selectedOccupiedDuration}
              price={selectedPrice}
              totalSlots={totalSlots}
            />
          </div>
        </div>
      </section>

      <section className="mt-3 surface-card max-w-full overflow-hidden rounded-[20px] p-3 sm:mt-4 sm:rounded-[24px] sm:p-5">
          <div className="mb-4 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold">Horarios disponiveis</h2>
              <p className="mt-1 text-sm text-zinc-400">
                {selectedDate
                  ? `Escolha um horario para ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("pt-BR")}.`
                  : "Escolha um dia para continuar."}
              </p>
            </div>

            {selectedServices.length > 0 && (
              <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-200 sm:px-4 sm:py-3">
                {selectedServices.length} servico(s) - {formatCurrency(selectedPrice)}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <FeedbackMessage message={availabilityError} tone="error" />
            <FeedbackMessage message={bookingError} tone="error" />
          </div>

          {!selectedBarberId || selectedServiceIds.length === 0 || !selectedDate ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
              Escolha barbeiro, servico e data para ver os horarios livres.
            </div>
          ) : availabilityLoading ? (
            <div className="mt-6 rounded-[24px] border border-white/10 bg-black/20 px-4 py-6 text-sm text-zinc-300">
              Buscando os melhores horarios para esse atendimento...
            </div>
          ) : !isDayAvailable ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-400">
              Esse barbeiro nao possui horario ativo nesse dia. Tente outra data.
            </div>
          ) : (
            <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-3">
              <TimeSection
                title="Manha"
                slots={periodSlots.morning}
                bookingSlot={bookingSlot}
                onBook={openBookingConfirmation}
              />

              <TimeSection
                title="Tarde"
                slots={periodSlots.afternoon}
                bookingSlot={bookingSlot}
                onBook={openBookingConfirmation}
              />

              <TimeSection
                title="Noite"
                slots={periodSlots.night}
                bookingSlot={bookingSlot}
                onBook={openBookingConfirmation}
              />
            </div>
          )}
      </section>

      {confirmationSlot ? (
        <BookingConfirmationDialog
          time={confirmationSlot}
          date={selectedDate}
          barberName={selectedBarber?.name || "Barbeiro"}
          services={selectedServices.map((service) => service.name)}
          duration={selectedOccupiedDuration}
          price={selectedPrice}
          isSubmitting={bookingSlot === confirmationSlot}
          onCancel={() => setConfirmationSlot(null)}
          onConfirm={(notes) => void bookAppointment(confirmationSlot, notes)}
        />
      ) : null}

      {bookingSuccess && bookingDetails ? (
        <BookingSuccessDialog
          details={bookingDetails}
          whatsappNumber={whatsappNumber}
        />
      ) : null}

      {previewBarber ? (
        <BarberPhotoPreviewDialog
          barber={previewBarber}
          onClose={() => setPreviewBarber(null)}
        />
      ) : null}
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
  onBook: (slot: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
        <span className="text-[11px] uppercase tracking-[0.12em] text-zinc-500 sm:tracking-[0.18em]">
          {slots.length} disponiveis
        </span>
      </div>

      {slots.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/10 px-4 py-4 text-sm text-zinc-500">
          Sem horarios livres nesse periodo. Tente outro periodo ou outro dia.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              disabled={Boolean(bookingSlot)}
              onClick={() => onBook(slot)}
              className="min-h-11 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold transition hover:border-[var(--brand)]/50 hover:bg-[var(--brand-muted)] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:px-4 sm:py-3"
            >
              {bookingSlot === slot ? "Reservando..." : slot}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BarberProfileStrip({
  barber,
  specialty,
  servicesCount,
  onPreview,
}: {
  barber: BarberOption;
  specialty: string;
  servicesCount: number;
  onPreview: (barber: BarberOption) => void;
}) {
  const imageSrc = getLocalBarberImage(barber.image);

  return (
    <div className="mt-3 flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <button
        type="button"
        onClick={() => {
          if (imageSrc) {
            onPreview(barber);
          }
        }}
        disabled={!imageSrc}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-500/30 via-white/10 to-black/20 text-sm font-bold text-[var(--brand-strong)] transition hover:border-[var(--brand)]/50 disabled:cursor-default"
        aria-label={imageSrc ? "Ampliar foto do barbeiro" : "Foto do barbeiro"}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={barber.name || "Barbeiro"}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          (barber.name || "B").slice(0, 1)
        )}
      </button>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {barber.name || "Barbeiro"}
        </p>
        <p className="mt-1 truncate text-xs text-zinc-400">{specialty}</p>
        <p className="mt-2 text-xs text-[var(--brand-strong)]">
          {servicesCount} servico(s) disponiveis
        </p>
      </div>
    </div>
  );
}

function BarberPhotoPreviewDialog({
  barber,
  onClose,
}: {
  barber: BarberOption;
  onClose: () => void;
}) {
  const imageSrc = getLocalBarberImage(barber.image);

  if (!imageSrc) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada do barbeiro"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050b16] p-4 text-white shadow-[0_24px_90px_rgba(0,0,0,0.7)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-strong)]">
              Foto do barbeiro
            </p>
            <p className="mt-1 truncate text-sm font-semibold">
              {barber.name || "Barbeiro"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 shrink-0 items-center justify-center rounded-xl border border-white/10 px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/10 hover:text-white"
          >
            Fechar
          </button>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <Image
            src={imageSrc}
            alt={barber.name || "Barbeiro"}
            fill
            sizes="(max-width: 640px) 90vw, 420px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

function BookingSummary({
  barberName,
  services,
  date,
  duration,
  price,
  totalSlots,
}: {
  barberName: string;
  services: string[];
  date: string;
  duration: number;
  price: number;
  totalSlots: number;
}) {
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="rounded-[24px] border border-[var(--brand)]/25 bg-[var(--brand-muted)]/40 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-strong)]">
        Resumo
      </p>
      <div className="mt-3 space-y-2 text-sm">
        <ConfirmationRow label="Barbeiro" value={barberName} />
        <ConfirmationRow
          label="Servicos"
          value={services.length ? services.join(", ") : "Nenhum servico"}
        />
        <ConfirmationRow label="Data" value={formattedDate} />
        <ConfirmationRow label="Duracao" value={duration ? `${duration} min` : "-"} />
        <ConfirmationRow label="Valor" value={price ? formatCurrency(price) : "-"} />
        <ConfirmationRow
          label="Horarios"
          value={services.length ? `${totalSlots} disponiveis` : "Aguardando"}
        />
      </div>
    </div>
  );
}

function BookingSuccessDialog({
  details,
  whatsappNumber,
}: {
  details: BookingDetails;
  whatsappNumber: string;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const formattedDate = new Date(`${details.date}T00:00:00`).toLocaleDateString(
    "pt-BR",
    {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    }
  );
  const whatsappMessage = encodeURIComponent(
    `Ola! Acabei de confirmar meu agendamento para ${formattedDate} as ${details.time} com ${details.barberName}.`
  );
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`
    : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-success-title"
    >
      <div className="max-h-[calc(100svh-32px)] w-full max-w-md overflow-y-auto rounded-2xl border border-[var(--brand)]/30 bg-[#050b16] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-muted)] text-[var(--brand-strong)] ring-1 ring-[var(--brand)]/30">
          <span className="text-sm font-bold">OK</span>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--brand-strong)]">
            Agendamento confirmado
          </p>
          <h2 id="booking-success-title" className="mt-2 text-2xl font-bold">
            Horario reservado
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Chegue 5 minutos antes do horario para garantir um atendimento tranquilo.
          </p>
        </div>

        <div className="mt-5 space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
          <ConfirmationRow label="Data" value={formattedDate} />
          <ConfirmationRow label="Horario" value={details.time} />
          <ConfirmationRow label="Barbeiro" value={details.barberName} />
          <ConfirmationRow label="Servicos" value={details.serviceNames.join(", ")} />
          <ConfirmationRow label="Valor" value={formatCurrency(details.price)} />
        </div>

        <div className="mt-5 grid gap-3">
          <Link
            href="/customer/agendamentos"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Ver meus agendamentos
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#25D366]/35 bg-[#25D366]/10 px-4 py-3 text-sm font-semibold text-[#9ff0bd] transition hover:bg-[#25D366]/15"
            >
              <WhatsAppIcon />
              Falar no WhatsApp
            </a>
          ) : null}
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Pagina inicial
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 448 512"
      className="h-4 w-4"
      fill="currentColor"
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32 101.5 32 1.9 131.6 1.9 254c0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3 18.6-68.1-4.4-7C49.1 322.8 39.4 288.9 39.4 254c0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.5-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.5-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.6-6.6z" />
    </svg>
  );
}

function BookingConfirmationDialog({
  time,
  date,
  barberName,
  services,
  duration,
  price,
  isSubmitting,
  onCancel,
  onConfirm,
}: {
  time: string;
  date: string;
  barberName: string;
  services: string[];
  duration: number;
  price: number;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (notes: string) => void;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [notes, setNotes] = useState("");
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-confirmation-title"
    >
      <div className="max-h-[calc(100svh-32px)] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#050b16] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--brand-strong)]">
          Confirmar agendamento
        </p>
        <h2 id="booking-confirmation-title" className="mt-2 text-2xl font-bold">
          Esta tudo certo?
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-400">
          Confira os dados antes de reservar esse horario.
        </p>

        <div className="mt-5 space-y-3 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm">
          <ConfirmationRow label="Data" value={formattedDate} />
          <ConfirmationRow label="Horario" value={time} />
          <ConfirmationRow label="Barbeiro" value={barberName} />
          <ConfirmationRow label="Servicos" value={services.join(", ")} />
          <ConfirmationRow label="Duracao" value={`${duration} min`} />
          <ConfirmationRow label="Valor" value={formatCurrency(price)} />
        </div>

        <label className="mt-5 block">
          <span className="text-sm font-semibold text-white">
            Observacao para o barbeiro
          </span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value.slice(0, 280))}
            disabled={isSubmitting}
            rows={3}
            maxLength={280}
            placeholder="Ex: prefiro acabamento mais baixo, tenho sensibilidade na pele..."
            className="mt-2 min-h-[96px] w-full resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[var(--brand)]/60 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <span className="mt-2 block text-right text-xs text-zinc-500">
            {notes.length}/280
          </span>
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Revisar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(notes)}
            disabled={isSubmitting}
            className="rounded-2xl bg-[var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Confirmando..." : "Confirmar agendamento"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function ConfirmationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="max-w-[220px] text-right font-semibold text-white">{value}</span>
    </div>
  );
}
