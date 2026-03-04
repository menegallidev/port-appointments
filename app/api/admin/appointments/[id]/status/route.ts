import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdminUser } from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { appointmentStatusSchema } from "@/lib/validators";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: Params) {
  try {
    const { user } = await requireAdminUser(request);
    const { id } = await context.params;

    const body = await request.json().catch(() => null);
    const parsed = appointmentStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new ApiError("Agendamento não encontrado.", 404);
    }

    const status = parsed.data.status;
    const shouldTrackApprover = status === "APPROVED" || status === "REJECTED";

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        approvedById: shouldTrackApprover ? user.id : appointment.approvedById,
      },
      include: {
        customer: true,
        service: true,
      },
    });

    return NextResponse.json({
      message: "Status atualizado com sucesso.",
      appointment: updated,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
