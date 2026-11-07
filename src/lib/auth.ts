import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { db, sessions, users, type SafeUser, type UserRecord } from "@/db";

export const SESSION_COOKIE_NAME = "meridian_session";
export const SIGNED_OUT_COOKIE_NAME = "meridian_signed_out";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function toSafeUser(user: UserRecord): SafeUser {
  const { passwordHash: _ignored, ...safe } = user;
  return safe;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  if (!salt || !originalHex) return false;
  try {
    const derived = scryptSync(password, salt, 64);
    const original = Buffer.from(originalHex, "hex");
    if (derived.length !== original.length) return false;
    return timingSafeEqual(derived, original);
  } catch {
    return false;
  }
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createUserSession(userId: number): Promise<string> {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    tokenHash,
    userId,
    expiresAt,
  });

  return rawToken;
}

export async function revokeSessionToken(rawToken: string): Promise<void> {
  const tokenHash = hashSessionToken(rawToken);
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}

export function attachSessionCookie(
  response: NextResponse,
  rawToken: string
): NextResponse {
  response.cookies.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
    secure: process.env.NODE_ENV === "production",
  });
  response.cookies.delete(SIGNED_OUT_COOKIE_NAME);
  return response;
}

export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.set(SIGNED_OUT_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function getSessionUser(): Promise<SafeUser | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!rawToken) return null;

    const tokenHash = hashSessionToken(rawToken);
    const now = new Date();

    const rows = await db
      .select({
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, now)))
      .limit(1);

    if (rows.length === 0) {
      return null;
    }

    return toSafeUser(rows[0].user);
  } catch {
    return null;
  }
}

export async function hasExplicitlySignedOut(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SIGNED_OUT_COOKIE_NAME)?.value === "1";
  } catch {
    return false;
  }
}
