import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  revokeSessionToken,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (rawToken) {
      await revokeSessionToken(rawToken);
    }
    const response = NextResponse.json({ ok: true });
    return clearSessionCookie(response);
  } catch (err) {
    console.error("Logout error:", err);
    const response = NextResponse.json({ ok: true });
    return clearSessionCookie(response);
  }
}
