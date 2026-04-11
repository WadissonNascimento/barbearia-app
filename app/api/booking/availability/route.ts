import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  BookingAvailabilityError,
  getBookingAvailability,
} from "@/lib/bookingAvailability";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ message: "Nao autorizado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
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
