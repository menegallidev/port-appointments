import { NextRequest, NextResponse } from "next/server";

import { JWT_COOKIE_NAME, verifySessionToken } from "@/lib/jwt";

function unauthorizedResponse(request: NextRequest, isApi: boolean) {
  if (isApi) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function forbiddenResponse(request: NextRequest, isApi: boolean) {
  if (isApi) {
    return NextResponse.json(
      { error: "Acesso restrito ao administrador." },
      { status: 403 },
    );
  }

  return NextResponse.redirect(new URL("/agendamento", request.url));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminPage = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  const token = request.cookies.get(JWT_COOKIE_NAME)?.value;
  if (!token) {
    return unauthorizedResponse(request, isAdminApi);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    return unauthorizedResponse(request, isAdminApi);
  }

  if (session.role !== "ADMIN") {
    return forbiddenResponse(request, isAdminApi);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
