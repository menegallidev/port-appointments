import { NextRequest, NextResponse } from "next/server";

import { ApiError, handleApiError, requireAdminUser } from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import { serviceCreateSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const services = await prisma.service.findMany({
      include: {
        _count: {
          select: {
            appointments: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ services });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminUser(request);

    const body = await request.json().catch(() => null);
    const parsed = serviceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const name = parsed.data.name.trim();
    const existing = await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw new ApiError("Já existe um serviço com este nome.", 409);
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: parsed.data.description?.trim() || null,
        durationMinutes: parsed.data.durationMinutes,
        price: parsed.data.price,
        isActive: parsed.data.isActive ?? true,
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
        message: "Serviço cadastrado com sucesso.",
        service,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
