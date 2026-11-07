import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { ensureSeeded } from "@/db/seed";
import {
  attachSessionCookie,
  createUserSession,
  toSafeUser,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureSeeded();
    let email = "areeb@meridian.studio";
    try {
      const body = await req.json();
      if (typeof body?.email === "string" && body.email.trim()) {
        email = body.email.trim().toLowerCase();
      }
    } catch {
      // default to areeb@meridian.studio when no JSON body sent
    }

    let found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (found.length === 0) {
      found = await db.select().from(users).limit(1);
    }

    if (found.length === 0) {
      return NextResponse.json(
        { error: "No studio accounts available" },
        { status: 404 }
      );
    }

    const token = await createUserSession(found[0].id);
    const response = NextResponse.json({
      user: toSafeUser(found[0]),
    });
    return attachSessionCookie(response, token);
  } catch (err) {
    console.error("Demo auth error:", err);
    return NextResponse.json(
      { error: "Unable to start demo session" },
      { status: 500 }
    );
  }
}
