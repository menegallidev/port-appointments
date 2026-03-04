import "server-only";

import { cookies } from "next/headers";

import prisma from "@/lib/prisma";
import { JWT_COOKIE_NAME, verifySessionToken } from "@/lib/jwt";

export async function getSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { customer: true },
  });
}
