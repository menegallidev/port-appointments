import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { handleApiError, setSessionCookie, toPublicUser } from "@/lib/api-auth";
import { signSessionToken } from "@/lib/jwt";
import { normalizePhone } from "@/lib/phone";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim().toLowerCase();
    const phone = normalizePhone(parsed.data.phone);
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe uma conta com este e-mail." },
        { status: 409 },
      );
    }

    const existingCustomer = await prisma.customer.findUnique({ where: { phone } });

    if (existingCustomer?.userId) {
      return NextResponse.json(
        { error: "Este telefone já está vinculado a outro usuário." },
        { status: 409 },
      );
    }

    const { user, customer } = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });

      const linkedCustomer = existingCustomer
        ? await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              userId: createdUser.id,
              name,
              email,
            },
          })
        : await tx.customer.create({
            data: {
              name,
              email,
              phone,
              userId: createdUser.id,
            },
          });

      return { user: createdUser, customer: linkedCustomer };
    });

    const token = await signSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json(
      {
        message: "Conta criada com sucesso.",
        user: toPublicUser({ ...user, customer }),
      },
      { status: 201 },
    );

    return setSessionCookie(response, token);
  } catch (error) {
    return handleApiError(error);
  }
}
