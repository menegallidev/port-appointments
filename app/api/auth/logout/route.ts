import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/api-auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logout realizado com sucesso." });
  return clearSessionCookie(response);
}
