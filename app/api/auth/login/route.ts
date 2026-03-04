import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { handleApiError, setSessionCookie, toPublicUser } from "@/lib/api-auth";
import { signSessionToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Dados inválidos." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { customer: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const token = await signSessionToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    const response = NextResponse.json({
      message: "Login realizado com sucesso.",
      user: toPublicUser(user),
    });

    return setSessionCookie(response, token);
  } catch (error) {
    return handleApiError(error);
  }
}
