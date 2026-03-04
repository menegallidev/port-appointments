import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdminUser } from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { serviceStatusSchema } from "@/lib/validators";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: Params) {
  try {
    await requireAdminUser(request);
    const { id } = await context.params;

    const body = await request.json().catch(() => null);
    const parsed = serviceStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const existing = await prisma.service.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError("Serviço não encontrado.", 404);
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        isActive: parsed.data.isActive,
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Serviço ${service.isActive ? "ativado" : "desativado"} com sucesso.`,
      service,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
