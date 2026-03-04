import { type JWTPayload, jwtVerify, SignJWT } from "jose";

export type SessionRole = "ADMIN" | "CUSTOMER";

export type SessionToken = JWTPayload & {
  userId: string;
  role: SessionRole;
  name: string;
  email: string;
};

export const JWT_COOKIE_NAME = "barber_token";
export const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-jwt-secret-change-me",
);

export async function signSessionToken(payload: {
  userId: string;
  role: SessionRole;
  name: string;
  email: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify<SessionToken>(token, secret);
    return payload;
  } catch {
    return null;
  }
}
