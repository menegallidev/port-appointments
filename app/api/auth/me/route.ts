import { NextRequest, NextResponse } from "next/server";

import { getSessionFromRequest, toPublicUser } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { customer: true },
  });

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user: toPublicUser(user) });
}
