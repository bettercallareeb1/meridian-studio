import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  attachSessionCookie,
  createUserSession,
  toSafeUser,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (found.length === 0 || !verifyPassword(password, found[0].passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await createUserSession(found[0].id);
    const response = NextResponse.json({
      user: toSafeUser(found[0]),
    });
    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Unable to sign in right now" },
      { status: 500 }
    );
  }
}
