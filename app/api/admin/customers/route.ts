import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdminUser } from "@/lib/api-auth";
import { normalizePhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { customerCreateSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const body = await request.json().catch(() => null);
    const parsed = customerCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const phone = normalizePhone(parsed.data.phone);
    const existing = await prisma.customer.findUnique({ where: { phone } });

    if (existing) {
      throw new ApiError("Já existe um cliente com este telefone.", 409);
    }

    const customer = await prisma.customer.create({
      data: {
        name: parsed.data.name.trim(),
        email: parsed.data.email?.trim() || null,
        phone,
        notes: parsed.data.notes?.trim() || null,
      },
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Cliente cadastrado com sucesso.",
        customer,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
