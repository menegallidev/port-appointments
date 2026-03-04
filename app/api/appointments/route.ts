import { NextRequest, NextResponse } from "next/server";

import {
  ApiError,
  getSessionFromRequest,
  handleApiError,
  requireAuthUser,
} from "@/lib/api-auth";
import { normalizePhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { appointmentCreateSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const { user } = await requireAuthUser(request);

    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [{ createdByUserId: user.id }, { customer: { userId: user.id } }],
      },
      include: {
        service: true,
        customer: true,
      },
      orderBy: { appointmentAt: "desc" },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = appointmentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const appointmentAt = new Date(parsed.data.appointmentAt);

    if (Number.isNaN(appointmentAt.getTime())) {
      throw new ApiError("Data/hora inválida.", 400);
    }

    if (appointmentAt <= new Date()) {
      throw new ApiError("A data/hora deve ser no futuro.", 400);
    }

    const service = await prisma.service.findFirst({
      where: {
        id: parsed.data.serviceId,
        isActive: true,
      },
    });

    if (!service) {
      throw new ApiError("Serviço não encontrado.", 404);
    }

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        serviceId: service.id,
        appointmentAt,
        status: {
          in: ["PENDING", "APPROVED"],
        },
      },
    });

    if (conflictingAppointment) {
      throw new ApiError(
        "Já existe um agendamento para este serviço neste horário.",
        409,
      );
    }

    const session = await getSessionFromRequest(request);
    let customerId: string;
    let createdByUserId: string | null = null;

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { customer: true },
      });

      if (!user) {
        throw new ApiError("Usuário não encontrado.", 401);
      }

      createdByUserId = user.id;

      if (user.customer) {
        customerId = user.customer.id;
      } else {
        if (!parsed.data.guestPhone) {
          throw new ApiError(
            "Informe um telefone para concluir o seu cadastro de cliente.",
            400,
          );
        }

        const guestPhone = normalizePhone(parsed.data.guestPhone);

        const customer = await prisma.customer.create({
          data: {
            name: user.name,
            email: user.email,
            phone: guestPhone,
            userId: user.id,
          },
        });

        customerId = customer.id;
      }
    } else {
      if (!parsed.data.guestName || !parsed.data.guestPhone) {
        throw new ApiError(
          "Para agendar sem conta, informe nome e telefone.",
          400,
        );
      }

      const guestPhone = normalizePhone(parsed.data.guestPhone);
      const existingCustomer = await prisma.customer.findUnique({
        where: { phone: guestPhone },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;

        if (!existingCustomer.userId) {
          await prisma.customer.update({
            where: { id: existingCustomer.id },
            data: {
              name: parsed.data.guestName.trim(),
              email: parsed.data.guestEmail?.trim() || existingCustomer.email,
            },
          });
        }
      } else {
        const customer = await prisma.customer.create({
          data: {
            name: parsed.data.guestName.trim(),
            email: parsed.data.guestEmail?.trim() || null,
            phone: guestPhone,
          },
        });

        customerId = customer.id;
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        customerId,
        serviceId: service.id,
        appointmentAt,
        notes: parsed.data.notes?.trim() || null,
        createdByUserId,
      },
      include: {
        customer: true,
        service: true,
      },
    });

    return NextResponse.json(
      {
        message: "Agendamento criado com sucesso e aguardando aprovação.",
        appointment,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
