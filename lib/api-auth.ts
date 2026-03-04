import type { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { JWT_COOKIE_NAME, verifySessionToken } from "@/lib/jwt";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function requireAuthUser(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    throw new ApiError("Não autenticado.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { customer: true },
  });

  if (!user) {
    throw new ApiError("Usuário não encontrado.", 401);
  }

  return { session, user };
}

export async function requireAdminUser(request: NextRequest) {
  const auth = await requireAuthUser(request);

  if (auth.user.role !== "ADMIN") {
    throw new ApiError("Acesso restrito ao administrador.", 403);
  }

  return auth;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(JWT_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(JWT_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}

export function toPublicUser(user: User & { customer?: { phone: string } | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.customer?.phone ?? null,
  };
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(error);
  return NextResponse.json(
    { error: "Erro interno ao processar a requisição." },
    { status: 500 },
  );
}
