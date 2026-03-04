import { AppointmentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { handleApiError, requireAdminUser } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const statusParam = request.nextUrl.searchParams.get("status");
    const status =
      statusParam && statusParam !== "ALL"
        ? (statusParam as AppointmentStatus)
        : null;

    const appointments = await prisma.appointment.findMany({
      where: status ? { status } : undefined,
      include: {
        customer: true,
        service: true,
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ appointmentAt: "asc" }],
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    return handleApiError(error);
  }
}
