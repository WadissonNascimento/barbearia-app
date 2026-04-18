import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  BookingAvailabilityError,
  getBookingAvailability,
} from "@/lib/bookingAvailability";
import {
  enforceRateLimit,
  logSecurityEvent,
  rateLimitResponse,
  readJsonWithLimit,
} from "@/lib/security";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    logSecurityEvent("access_denied", {
      route: "/api/booking/availability",
      role: session?.user?.role || "anonymous",
    });
    return NextResponse.json({ message: "Nao autorizado." }, { status: 401 });
  }

  const rateLimit = await enforceRateLimit({
    scope: "booking:availability",
    identifier: session.user.id,
    limit: 90,
    windowMs: 15 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return rateLimitResponse("Muitas consultas de horarios. Aguarde e tente novamente.");
  }

  try {
    const body = (await readJsonWithLimit(request, 8 * 1024)) as {
      barberId?: string;
      serviceIds?: string[];
      date?: string;
    };

    const barberId = String(body.barberId || "").trim();
    const serviceIds = Array.isArray(body.serviceIds)
      ? body.serviceIds.map((value) => String(value).trim()).filter(Boolean)
      : [];
    const date = String(body.date || "").trim();

    const availability = await getBookingAvailability({
      barberId,
      serviceIds,
      date,
    });

    return NextResponse.json(availability);
  } catch (error) {
    if (error instanceof Error && error.message === "PAYLOAD_TOO_LARGE") {
      return NextResponse.json({ message: "Requisicao muito grande." }, { status: 413 });
    }

    if (error instanceof BookingAvailabilityError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    console.error("Erro ao carregar disponibilidade:", error);
    return NextResponse.json(
      { message: "Nao foi possivel carregar os horarios." },
      { status: 500 }
    );
  }
}
